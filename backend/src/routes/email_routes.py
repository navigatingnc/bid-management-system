from flask import Blueprint, request, jsonify, redirect, url_for, session
import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from src.services.email_service import process_emails, get_email_details
from src.models.models import EmailCredential
from src.main import db

bp = Blueprint('email', __name__, url_prefix='/api/email')

# OAuth2 configuration
CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'client_secret.json')
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
API_SERVICE_NAME = 'gmail'
API_VERSION = 'v1'

@bp.route('/auth', methods=['GET'])
def authorize():
    """Initiate the OAuth2 authorization flow"""
    # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=request.base_url + '/callback'
    )
    
    # Generate URL for request to Google's OAuth 2.0 server
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    # Store the state in the session for later validation
    session['state'] = state
    
    # Redirect the user to Google's OAuth 2.0 server
    return redirect(authorization_url)

@bp.route('/auth/callback', methods=['GET'])
def oauth2callback():
    """Handle the OAuth2 callback from Google"""
    # Specify the state when creating the flow in the callback
    state = session.get('state', None)
    
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        state=state,
        redirect_uri=request.base_url
    )
    
    # Use the authorization server's response to fetch the OAuth 2.0 tokens
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)
    
    # Store credentials in the database
    credentials = flow.credentials
    
    # Get user email from the Gmail API
    gmail_service = build(API_SERVICE_NAME, API_VERSION, credentials=credentials)
    user_info = gmail_service.users().getProfile(userId='me').execute()
    email = user_info.get('emailAddress')
    
    # Save or update credentials in database
    cred = EmailCredential.query.filter_by(email=email).first()
    if not cred:
        cred = EmailCredential(email=email)
    
    # Store token information
    token_info = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
    cred.set_token(token_info)
    
    db.session.add(cred)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Successfully authenticated {email}',
        'email': email
    })

@bp.route('/check', methods=['GET'])
def check_auth():
    """Check if any email accounts are authenticated"""
    credentials = EmailCredential.query.all()
    return jsonify({
        'authenticated': len(credentials) > 0,
        'accounts': [cred.email for cred in credentials]
    })

@bp.route('/process', methods=['POST'])
def process_new_emails():
    """Process new emails for bid invitations"""
    data = request.json
    email_account = data.get('email')
    query = data.get('query', 'subject:(bid invitation) OR subject:(request for proposal) OR subject:(RFP)')
    max_results = data.get('max_results', 10)
    
    if not email_account:
        return jsonify({'error': 'Email account is required'}), 400
    
    # Get credentials from database
    cred_record = EmailCredential.query.filter_by(email=email_account).first()
    if not cred_record:
        return jsonify({'error': 'Email account not authenticated'}), 401
    
    # Create credentials object
    token_info = cred_record.get_token()
    credentials = Credentials(
        token=token_info['token'],
        refresh_token=token_info['refresh_token'],
        token_uri=token_info['token_uri'],
        client_id=token_info['client_id'],
        client_secret=token_info['client_secret'],
        scopes=token_info['scopes']
    )
    
    # Process emails
    try:
        results = process_emails(credentials, query, max_results)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/email/<message_id>', methods=['GET'])
def get_email(message_id):
    """Get details of a specific email"""
    email_account = request.args.get('email')
    
    if not email_account:
        return jsonify({'error': 'Email account is required'}), 400
    
    # Get credentials from database
    cred_record = EmailCredential.query.filter_by(email=email_account).first()
    if not cred_record:
        return jsonify({'error': 'Email account not authenticated'}), 401
    
    # Create credentials object
    token_info = cred_record.get_token()
    credentials = Credentials(
        token=token_info['token'],
        refresh_token=token_info['refresh_token'],
        token_uri=token_info['token_uri'],
        client_id=token_info['client_id'],
        client_secret=token_info['client_secret'],
        scopes=token_info['scopes']
    )
    
    # Get email details
    try:
        email_data = get_email_details(credentials, message_id)
        return jsonify(email_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
