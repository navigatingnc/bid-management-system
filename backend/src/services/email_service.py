import os
import base64
import email
from email.header import decode_header
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from src.models.models import Project, Document
from src.main import db
from src.utils.file_utils import save_attachment
import datetime
import re

def process_emails(credentials, query='subject:(bid invitation)', max_results=10):
    """
    Process emails matching the query for bid invitations
    
    Args:
        credentials: Google OAuth2 credentials
        query: Gmail search query
        max_results: Maximum number of emails to process
        
    Returns:
        Dictionary with processing results
    """
    # Build the Gmail API service
    service = build('gmail', 'v1', credentials=credentials)
    
    try:
        # Get messages matching the query
        response = service.users().messages().list(
            userId='me',
            q=query,
            maxResults=max_results
        ).execute()
        
        messages = response.get('messages', [])
        
        if not messages:
            return {'message': 'No new bid invitations found', 'processed': 0}
        
        processed_count = 0
        new_projects = []
        
        # Process each message
        for message in messages:
            message_id = message['id']
            
            # Check if this email has already been processed
            existing_project = Project.query.filter_by(email_subject=f"Gmail-{message_id}").first()
            if existing_project:
                continue
                
            # Get the message details
            msg = service.users().messages().get(userId='me', id=message_id).execute()
            
            # Extract email details
            headers = msg['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
            from_header = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
            
            # Extract sender name and email
            sender_name = ''
            sender_email = ''
            if from_header:
                match = re.match(r'(.*?)\s*<(.+@.+)>', from_header)
                if match:
                    sender_name = match.group(1).strip()
                    sender_email = match.group(2).strip()
                else:
                    sender_email = from_header.strip()
            
            # Extract email body
            body = ''
            if 'parts' in msg['payload']:
                for part in msg['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                        break
            elif 'body' in msg['payload'] and 'data' in msg['payload']['body']:
                body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode('utf-8')
            
            # Extract bid due date from email body or subject
            bid_due_date = None
            due_date_patterns = [
                r'due\s+(?:date|by)?:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
                r'bid\s+(?:date|by)?:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
                r'deadline:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
            ]
            
            for pattern in due_date_patterns:
                match = re.search(pattern, body, re.IGNORECASE) or re.search(pattern, subject, re.IGNORECASE)
                if match:
                    date_str = match.group(1)
                    try:
                        # Try different date formats
                        for fmt in ['%m/%d/%Y', '%m-%d-%Y', '%m/%d/%y', '%m-%d-%y']:
                            try:
                                bid_due_date = datetime.datetime.strptime(date_str, fmt)
                                break
                            except ValueError:
                                continue
                    except Exception:
                        pass
                    break
            
            # Create a new project
            project = Project(
                name=subject,
                email_subject=f"Gmail-{message_id}",  # Use this to track processed emails
                bid_due_date=bid_due_date,
                sender_name=sender_name,
                sender_email=sender_email,
                email_body=body
            )
            
            db.session.add(project)
            db.session.commit()
            
            # Process attachments
            if 'parts' in msg['payload']:
                process_attachments(service, message_id, project.id)
            
            new_projects.append({
                'id': project.id,
                'name': project.name,
                'bid_due_date': project.bid_due_date.isoformat() if project.bid_due_date else None,
                'sender': f"{project.sender_name} <{project.sender_email}>" if project.sender_name else project.sender_email
            })
            
            processed_count += 1
        
        return {
            'message': f'Processed {processed_count} new bid invitations',
            'processed': processed_count,
            'new_projects': new_projects
        }
        
    except HttpError as error:
        return {'error': f'An error occurred: {error}'}


def process_attachments(service, message_id, project_id):
    """
    Process attachments for a specific email message
    
    Args:
        service: Gmail API service
        message_id: Email message ID
        project_id: Project ID to associate attachments with
    """
    try:
        # Get the message with full content
        message = service.users().messages().get(userId='me', id=message_id, format='full').execute()
        
        if 'payload' not in message or 'parts' not in message['payload']:
            return
        
        # Create storage directory for this project
        storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                  'storage', 'projects', str(project_id))
        os.makedirs(storage_dir, exist_ok=True)
        
        # Process message parts recursively
        process_parts(service, message_id, message['payload']['parts'], project_id, storage_dir)
        
    except HttpError as error:
        print(f'An error occurred processing attachments: {error}')


def process_parts(service, message_id, parts, project_id, storage_dir, part_path=''):
    """
    Recursively process message parts to find attachments
    
    Args:
        service: Gmail API service
        message_id: Email message ID
        parts: Message parts to process
        project_id: Project ID to associate attachments with
        storage_dir: Directory to store attachments
        part_path: Path to the current part (for nested parts)
    """
    for i, part in enumerate(parts):
        current_path = f"{part_path}.{i}" if part_path else str(i)
        
        # Check if this part has nested parts
        if 'parts' in part:
            process_parts(service, message_id, part['parts'], project_id, storage_dir, current_path)
            continue
        
        # Check if this part is an attachment
        if 'filename' in part and part['filename'] and 'attachmentId' in part['body']:
            filename = part['filename']
            
            # Decode filename if needed
            if isinstance(filename, bytes):
                filename = filename.decode()
            
            # Only process PDF files
            if not filename.lower().endswith('.pdf'):
                continue
                
            attachment = service.users().messages().attachments().get(
                userId='me',
                messageId=message_id,
                id=part['body']['attachmentId']
            ).execute()
            
            # Decode attachment data
            file_data = base64.urlsafe_b64decode(attachment['data'])
            
            # Save attachment to file system
            file_path = os.path.join(storage_dir, filename)
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            # Determine document type based on filename
            document_type = 'unknown'
            if re.search(r'plan|drawing', filename, re.IGNORECASE):
                document_type = 'plans'
            elif re.search(r'spec|specification', filename, re.IGNORECASE):
                document_type = 'specifications'
            elif re.search(r'addendum|amendment', filename, re.IGNORECASE):
                document_type = 'addendum'
            
            # Create document record in database
            document = Document(
                project_id=project_id,
                filename=os.path.basename(file_path),
                original_filename=filename,
                file_path=file_path,
                file_size=len(file_data),
                mime_type='application/pdf',
                document_type=document_type
            )
            
            db.session.add(document)
            db.session.commit()


def get_email_details(credentials, message_id):
    """
    Get detailed information about a specific email
    
    Args:
        credentials: Google OAuth2 credentials
        message_id: Email message ID
        
    Returns:
        Dictionary with email details
    """
    # Build the Gmail API service
    service = build('gmail', 'v1', credentials=credentials)
    
    try:
        # Get the message
        message = service.users().messages().get(userId='me', id=message_id, format='full').execute()
        
        # Extract headers
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
        from_header = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
        to_header = next((h['value'] for h in headers if h['name'].lower() == 'to'), '')
        date_header = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
        
        # Extract body
        body = ''
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                if part['mimeType'] == 'text/plain':
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                    break
        elif 'body' in message['payload'] and 'data' in message['payload']['body']:
            body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode('utf-8')
        
        # Get attachment list
        attachments = []
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                if 'filename' in part and part['filename']:
                    attachments.append({
                        'filename': part['filename'],
                        'mimeType': part['mimeType'],
                        'size': part['body'].get('size', 0) if 'body' in part else 0
                    })
        
        return {
            'id': message_id,
            'subject': subject,
            'from': from_header,
            'to': to_header,
            'date': date_header,
            'body': body,
            'attachments': attachments
        }
        
    except HttpError as error:
        return {'error': f'An error occurred: {error}'}
