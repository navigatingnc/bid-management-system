import os
import fitz  # PyMuPDF
import pdfplumber
import re
from src.models.models import Document

def extract_text_from_pdf(file_path):
    """
    Extract text content from a PDF file using PyMuPDF
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text content
    """
    try:
        text = ""
        with fitz.open(file_path) as pdf:
            for page in pdf:
                text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF {file_path}: {e}")
        return ""

def extract_text_with_positions(file_path):
    """
    Extract text with position information using pdfplumber
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        List of dictionaries containing text and position information
    """
    try:
        results = []
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                words = page.extract_words()
                for word in words:
                    results.append({
                        'text': word['text'],
                        'page': page_num + 1,
                        'x0': word['x0'],
                        'y0': word['top'],
                        'x1': word['x1'],
                        'y1': word['bottom']
                    })
        return results
    except Exception as e:
        print(f"Error extracting text with positions from PDF {file_path}: {e}")
        return []

def extract_specification_section(file_path, section_name):
    """
    Extract content from a specific specification section
    
    Args:
        file_path: Path to the PDF file
        section_name: Name of the section to extract (e.g., "Division 09 – Finishes")
        
    Returns:
        Extracted section content
    """
    try:
        text = extract_text_from_pdf(file_path)
        
        # Create a pattern to match the section name
        # This is a simplified approach and may need refinement based on actual document structure
        pattern = re.compile(f"{re.escape(section_name)}.*?(?=DIVISION|SECTION|$)", re.DOTALL | re.IGNORECASE)
        
        match = pattern.search(text)
        if match:
            return match.group(0)
        else:
            return f"Section '{section_name}' not found in the document."
    except Exception as e:
        print(f"Error extracting section from PDF {file_path}: {e}")
        return f"Error extracting section: {str(e)}"

def highlight_text_in_pdf(input_path, output_path, text_to_highlight):
    """
    Create a new PDF with highlighted text
    
    Args:
        input_path: Path to the input PDF file
        output_path: Path to save the highlighted PDF
        text_to_highlight: Text to highlight in the PDF
        
    Returns:
        Path to the highlighted PDF
    """
    try:
        doc = fitz.open(input_path)
        
        for page in doc:
            # Search for text instances
            text_instances = page.search_for(text_to_highlight)
            
            # Add highlight annotations
            for inst in text_instances:
                highlight = page.add_highlight_annot(inst)
                highlight.update()
        
        # Save the modified document
        doc.save(output_path)
        doc.close()
        
        return output_path
    except Exception as e:
        print(f"Error highlighting text in PDF {input_path}: {e}")
        return None

def extract_quantities_and_materials(text):
    """
    Extract quantities and materials from specification text
    
    Args:
        text: Text content to analyze
        
    Returns:
        Dictionary of extracted quantities and materials
    """
    results = {
        'quantities': [],
        'materials': []
    }
    
    # Pattern for quantities (numbers followed by units)
    quantity_pattern = re.compile(r'(\d+(?:\.\d+)?)\s*(sq\s*ft|ft|inch|in|mm|cm|m|yards|yd)', re.IGNORECASE)
    quantities = quantity_pattern.findall(text)
    
    # Pattern for common construction materials
    material_pattern = re.compile(r'\b(concrete|steel|wood|timber|drywall|gypsum|insulation|paint|flooring|tile|brick|glass|aluminum|copper|pvc|vinyl)\b', re.IGNORECASE)
    materials = material_pattern.findall(text)
    
    # Add found quantities
    for qty, unit in quantities:
        results['quantities'].append(f"{qty} {unit}")
    
    # Add found materials (unique only)
    results['materials'] = list(set([m.lower() for m in materials]))
    
    return results

def get_document_metadata(document_id):
    """
    Get metadata for a document including extracted information
    
    Args:
        document_id: ID of the document
        
    Returns:
        Dictionary with document metadata and extracted information
    """
    document = Document.query.get(document_id)
    if not document:
        return {'error': f'Document with ID {document_id} not found'}
    
    # Basic metadata
    metadata = document.to_dict()
    
    # Extract text sample (first 1000 characters)
    text = extract_text_from_pdf(document.file_path)
    metadata['text_sample'] = text[:1000] if text else ""
    
    # Get page count
    try:
        with fitz.open(document.file_path) as pdf:
            metadata['page_count'] = len(pdf)
    except Exception:
        metadata['page_count'] = 0
    
    return metadata
