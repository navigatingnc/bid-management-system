import os

def save_attachment(file_data, project_id, filename):
    """
    Save an attachment to the file system
    
    Args:
        file_data: Binary file data
        project_id: Project ID to associate the file with
        filename: Name of the file
        
    Returns:
        Path to the saved file
    """
    # Create storage directory for this project
    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                              'storage', 'projects', str(project_id))
    os.makedirs(storage_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(storage_dir, filename)
    with open(file_path, 'wb') as f:
        f.write(file_data)
    
    return file_path

def get_file_extension(filename):
    """
    Get the file extension from a filename
    
    Args:
        filename: Name of the file
        
    Returns:
        File extension (lowercase)
    """
    return os.path.splitext(filename)[1].lower()

def is_pdf_file(filename):
    """
    Check if a file is a PDF based on extension
    
    Args:
        filename: Name of the file
        
    Returns:
        True if the file is a PDF, False otherwise
    """
    return get_file_extension(filename) == '.pdf'

def get_document_type(filename):
    """
    Determine document type based on filename
    
    Args:
        filename: Name of the file
        
    Returns:
        Document type string
    """
    filename_lower = filename.lower()
    
    if any(term in filename_lower for term in ['plan', 'drawing', 'dwg']):
        return 'plans'
    elif any(term in filename_lower for term in ['spec', 'specification']):
        return 'specifications'
    elif any(term in filename_lower for term in ['addendum', 'amendment']):
        return 'addendum'
    elif any(term in filename_lower for term in ['contract', 'agreement']):
        return 'contract'
    elif any(term in filename_lower for term in ['rfp', 'request for proposal', 'bid']):
        return 'bid_document'
    else:
        return 'other'
