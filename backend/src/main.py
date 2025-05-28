import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # Required for proper imports

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import json

# Initialize Flask app
app = Flask(__name__)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Import routes after app initialization to avoid circular imports
from src.routes import email_routes, project_routes, document_routes, proposal_routes

# Register blueprints
app.register_blueprint(email_routes.bp)
app.register_blueprint(project_routes.bp)
app.register_blueprint(document_routes.bp)
app.register_blueprint(proposal_routes.bp)

@app.route('/')
def index():
    return jsonify({"status": "API is running", "version": "1.0.0"})

if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
