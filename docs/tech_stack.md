# Technology Stack Selection

## Overview
This document outlines the technology stack selection for the Construction Bid Management System, with rationale for each choice based on the project requirements.

## Architecture
The application will follow a full-stack architecture with:
- Backend API server for data processing and storage
- Frontend web application for user interface
- Local database for data persistence
- File storage system for document management

## Selected Technologies

### Backend
- **Framework**: Flask (Python)
  - Rationale: Flask provides a lightweight yet powerful framework for building APIs and handling server-side operations. It's well-suited for applications requiring database functionality and server-side processing.
  - The application needs robust backend capabilities for email processing, PDF parsing, and data management.

### Frontend
- **Framework**: React
  - Rationale: React offers a component-based architecture ideal for building interactive UIs with reusable components.
  - The dashboard, project details pages, and PDF viewing interfaces will benefit from React's efficient rendering and state management.
  - Will use Tailwind CSS for styling to create a clean, modern interface.

### Database
- **Database System**: SQLite
  - Rationale: SQLite provides a serverless, self-contained database that's easy to deploy in a local environment.
  - For a locally hosted application, SQLite eliminates the need for a separate database server while providing robust data storage.
  - Can be easily upgraded to PostgreSQL if scaling becomes necessary.

### Email Integration
- **API**: Gmail API with OAuth2
  - Rationale: Direct integration with Gmail API provides secure access to email content and attachments.
  - OAuth2 ensures secure authentication without storing user credentials.

### PDF Processing
- **Libraries**: 
  - PyMuPDF (fitz) for PDF parsing and content extraction
  - pdfplumber for more detailed text extraction and positioning
  - WeasyPrint for PDF generation (proposals)
  - Rationale: These libraries provide comprehensive capabilities for both reading from and writing to PDF documents.

### File Storage
- **System**: Local file system with organized directory structure
  - Rationale: For a locally hosted application, direct file system storage is efficient and straightforward.
  - Will implement proper file organization and metadata tracking in the database.

### Deployment
- **Method**: Docker containerization
  - Rationale: Docker provides an isolated, consistent environment that simplifies deployment across different systems.
  - Will include Docker Compose for easy setup of all required services.

## Project Structure
The application will follow a structured organization:
- `/backend`: Flask application
  - `/src`: Source code
    - `/models`: Database models
    - `/routes`: API endpoints
    - `/services`: Business logic
    - `/utils`: Helper functions
  - `requirements.txt`: Python dependencies
- `/frontend`: React application
  - `/src`: Source code
    - `/components`: Reusable UI components
    - `/pages`: Application pages
    - `/services`: API integration
  - `package.json`: JavaScript dependencies
- `/docs`: Documentation
- `/docker`: Docker configuration files
