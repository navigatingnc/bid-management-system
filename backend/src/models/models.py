from datetime import datetime
from src.main import db

class Project(db.Model):
    """Model for construction bid projects"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    bid_due_date = db.Column(db.DateTime)
    sender_name = db.Column(db.String(255))
    sender_email = db.Column(db.String(255))
    email_subject = db.Column(db.String(255))
    email_body = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = db.relationship('Document', backref='project', lazy=True, cascade="all, delete-orphan")
    estimates = db.relationship('Estimate', backref='project', lazy=True, cascade="all, delete-orphan")
    proposals = db.relationship('Proposal', backref='project', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'bid_due_date': self.bid_due_date.isoformat() if self.bid_due_date else None,
            'sender_name': self.sender_name,
            'sender_email': self.sender_email,
            'email_subject': self.email_subject,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'document_count': len(self.documents)
        }


class Document(db.Model):
    """Model for project documents (PDFs)"""
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255))
    file_path = db.Column(db.String(512), nullable=False)
    file_size = db.Column(db.Integer)  # Size in bytes
    mime_type = db.Column(db.String(100))
    document_type = db.Column(db.String(50))  # e.g., "plans", "specifications", "addendum"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'document_type': self.document_type,
            'created_at': self.created_at.isoformat()
        }


class Estimate(db.Model):
    """Model for cost estimates"""
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    total_cost = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('EstimateItem', backref='estimate', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'total_cost': self.total_cost,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'item_count': len(self.items)
        }


class EstimateItem(db.Model):
    """Model for individual line items in an estimate"""
    id = db.Column(db.Integer, primary_key=True)
    estimate_id = db.Column(db.Integer, db.ForeignKey('estimate.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Float)
    unit = db.Column(db.String(50))
    unit_cost = db.Column(db.Float)
    total_cost = db.Column(db.Float)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'estimate_id': self.estimate_id,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'unit_cost': self.unit_cost,
            'total_cost': self.total_cost,
            'notes': self.notes
        }


class Proposal(db.Model):
    """Model for generated proposals"""
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    estimate_id = db.Column(db.Integer, db.ForeignKey('estimate.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    scope_summary = db.Column(db.Text)
    terms_conditions = db.Column(db.Text)
    file_path = db.Column(db.String(512))  # Path to generated PDF
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'estimate_id': self.estimate_id,
            'title': self.title,
            'scope_summary': self.scope_summary,
            'file_path': self.file_path,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class EmailCredential(db.Model):
    """Model for storing Gmail OAuth credentials"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    token_info = db.Column(db.Text)  # JSON string of token data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_token(self):
        """Return the token as a dictionary"""
        if self.token_info:
            return json.loads(self.token_info)
        return None
    
    def set_token(self, token_dict):
        """Store token dictionary as JSON string"""
        self.token_info = json.dumps(token_dict)
