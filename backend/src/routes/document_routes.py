from flask import Blueprint, request, jsonify, send_file
from src.models.models import Document, Project
from src.main import db
from src.utils.file_utils import save_attachment, get_document_type
import os
import mimetypes

bp = Blueprint('document', __name__, url_prefix='/api/documents')

@bp.route('/', methods=['GET'])
def get_documents():
    """Get all documents or filter by project"""
    project_id = request.args.get('project_id', type=int)
    
    if project_id:
        documents = Document.query.filter_by(project_id=project_id).all()
    else:
        documents = Document.query.all()
    
    return jsonify([document.to_dict() for document in documents])

@bp.route('/<int:document_id>', methods=['GET'])
def get_document(document_id):
    """Get a specific document by ID"""
    document = Document.query.get_or_404(document_id)
    return jsonify(document.to_dict())

@bp.route('/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    """Download a document file"""
    document = Document.query.get_or_404(document_id)
    
    if not os.path.exists(document.file_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(document.file_path, 
                     mimetype=document.mime_type or 'application/octet-stream',
                     as_attachment=True,
                     download_name=document.original_filename or document.filename)

@bp.route('/', methods=['POST'])
def upload_document():
    """Upload a new document"""
    # Check if project_id is provided
    if 'project_id' not in request.form:
        return jsonify({'error': 'Project ID is required'}), 400
    
    project_id = request.form.get('project_id', type=int)
    
    # Verify project exists
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': f'Project with ID {project_id} not found'}), 404
    
    # Check if file is provided
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save file
    original_filename = file.filename
    file_data = file.read()
    
    # Create storage directory for this project
    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                              'storage', 'projects', str(project_id))
    os.makedirs(storage_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(storage_dir, original_filename)
    with open(file_path, 'wb') as f:
        f.write(file_data)
    
    # Determine document type
    document_type = request.form.get('document_type') or get_document_type(original_filename)
    
    # Determine mime type
    mime_type = mimetypes.guess_type(original_filename)[0] or 'application/octet-stream'
    
    # Create document record
    document = Document(
        project_id=project_id,
        filename=os.path.basename(file_path),
        original_filename=original_filename,
        file_path=file_path,
        file_size=len(file_data),
        mime_type=mime_type,
        document_type=document_type
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify(document.to_dict()), 201

@bp.route('/<int:document_id>', methods=['PUT'])
def update_document(document_id):
    """Update document metadata"""
    document = Document.query.get_or_404(document_id)
    data = request.json
    
    # Update fields if provided
    if 'document_type' in data:
        document.document_type = data['document_type']
    
    if 'original_filename' in data:
        document.original_filename = data['original_filename']
    
    db.session.commit()
    
    return jsonify(document.to_dict())

@bp.route('/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    """Delete a document"""
    document = Document.query.get_or_404(document_id)
    
    # Delete file from filesystem
    if os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception as e:
            print(f"Error deleting file {document.file_path}: {e}")
    
    # Delete document from database
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': f'Document {document_id} deleted successfully'})
