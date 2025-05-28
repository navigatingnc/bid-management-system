from flask import Blueprint, request, jsonify
from src.models.models import Project, Document
from src.main import db
import os
import datetime

bp = Blueprint('project', __name__, url_prefix='/api/projects')

@bp.route('/', methods=['GET'])
def get_projects():
    """Get all projects"""
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([project.to_dict() for project in projects])

@bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project by ID"""
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())

@bp.route('/', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.json
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    
    # Parse bid due date if provided
    bid_due_date = None
    if data.get('bid_due_date'):
        try:
            bid_due_date = datetime.datetime.fromisoformat(data['bid_due_date'])
        except ValueError:
            return jsonify({'error': 'Invalid bid due date format'}), 400
    
    # Create new project
    project = Project(
        name=data['name'],
        bid_due_date=bid_due_date,
        sender_name=data.get('sender_name'),
        sender_email=data.get('sender_email'),
        email_subject=data.get('email_subject'),
        email_body=data.get('email_body')
    )
    
    db.session.add(project)
    db.session.commit()
    
    # Create storage directory for this project
    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                              'storage', 'projects', str(project.id))
    os.makedirs(storage_dir, exist_ok=True)
    
    return jsonify(project.to_dict()), 201

@bp.route('/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update an existing project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    # Update fields if provided
    if 'name' in data:
        project.name = data['name']
    
    if 'bid_due_date' in data:
        if data['bid_due_date']:
            try:
                project.bid_due_date = datetime.datetime.fromisoformat(data['bid_due_date'])
            except ValueError:
                return jsonify({'error': 'Invalid bid due date format'}), 400
        else:
            project.bid_due_date = None
    
    if 'sender_name' in data:
        project.sender_name = data['sender_name']
    
    if 'sender_email' in data:
        project.sender_email = data['sender_email']
    
    if 'email_subject' in data:
        project.email_subject = data['email_subject']
    
    if 'email_body' in data:
        project.email_body = data['email_body']
    
    db.session.commit()
    
    return jsonify(project.to_dict())

@bp.route('/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project"""
    project = Project.query.get_or_404(project_id)
    
    # Delete associated documents from filesystem
    for document in project.documents:
        if os.path.exists(document.file_path):
            try:
                os.remove(document.file_path)
            except Exception as e:
                print(f"Error deleting file {document.file_path}: {e}")
    
    # Delete project directory if it exists
    project_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                              'storage', 'projects', str(project.id))
    if os.path.exists(project_dir):
        try:
            os.rmdir(project_dir)
        except Exception as e:
            print(f"Error deleting directory {project_dir}: {e}")
    
    # Delete project from database (cascade will delete related records)
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': f'Project {project_id} deleted successfully'})

@bp.route('/<int:project_id>/documents', methods=['GET'])
def get_project_documents(project_id):
    """Get all documents for a specific project"""
    Project.query.get_or_404(project_id)  # Verify project exists
    documents = Document.query.filter_by(project_id=project_id).all()
    return jsonify([document.to_dict() for document in documents])

@bp.route('/<int:project_id>/summary', methods=['GET'])
def get_project_summary(project_id):
    """Get a summary of a project including document counts by type"""
    project = Project.query.get_or_404(project_id)
    
    # Count documents by type
    document_counts = {}
    for document in project.documents:
        doc_type = document.document_type or 'other'
        if doc_type in document_counts:
            document_counts[doc_type] += 1
        else:
            document_counts[doc_type] = 1
    
    # Get estimate count
    estimate_count = len(project.estimates)
    
    # Get proposal count
    proposal_count = len(project.proposals)
    
    return jsonify({
        **project.to_dict(),
        'document_counts': document_counts,
        'estimate_count': estimate_count,
        'proposal_count': proposal_count
    })
