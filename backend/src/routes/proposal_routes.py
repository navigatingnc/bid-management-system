from flask import Blueprint, request, jsonify
from src.models.models import Document
from src.services.pdf_service import extract_text_from_pdf, extract_specification_section, extract_quantities_and_materials, get_document_metadata
import os

bp = Blueprint('proposal', __name__, url_prefix='/api/proposals')

@bp.route('/document/<int:document_id>/extract', methods=['GET'])
def extract_document_text(document_id):
    """Extract text from a document"""
    document = Document.query.get_or_404(document_id)
    
    if not os.path.exists(document.file_path):
        return jsonify({'error': 'File not found'}), 404
    
    text = extract_text_from_pdf(document.file_path)
    
    return jsonify({
        'document_id': document_id,
        'text': text
    })

@bp.route('/document/<int:document_id>/section', methods=['GET'])
def extract_document_section(document_id):
    """Extract a specific section from a document"""
    document = Document.query.get_or_404(document_id)
    
    if not os.path.exists(document.file_path):
        return jsonify({'error': 'File not found'}), 404
    
    section_name = request.args.get('section', '')
    if not section_name:
        return jsonify({'error': 'Section name is required'}), 400
    
    section_text = extract_specification_section(document.file_path, section_name)
    
    # Extract quantities and materials
    analysis = extract_quantities_and_materials(section_text)
    
    return jsonify({
        'document_id': document_id,
        'section_name': section_name,
        'text': section_text,
        'analysis': analysis
    })

@bp.route('/document/<int:document_id>/metadata', methods=['GET'])
def get_document_meta(document_id):
    """Get metadata for a document"""
    metadata = get_document_metadata(document_id)
    
    if 'error' in metadata:
        return jsonify(metadata), 404
    
    return jsonify(metadata)
