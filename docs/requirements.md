# Construction Bid Management System Requirements

## Overview
This document outlines the requirements for an open-source, locally hosted application that streamlines the intake and management of construction bid invitations received via email. The system will connect to a Gmail account, process bid emails and attachments, create new projects, and assist in generating cost estimates and proposals.

## 1. Email Integration (Gmail)
- **Authentication**: Secure connection to Gmail using OAuth2
- **Email Retrieval**: Ability to retrieve emails matching defined criteria (e.g., subject line contains "Bid Invitation" or specific sender domains)
- **Attachment Handling**: Download and store email content and attachments (particularly PDFs including plans and specifications)

## 2. Project Management System
- **Automatic Project Creation**: Create new project entries upon detecting qualifying bid invitations
- **Metadata Storage**: Store project information including:
  - Project name
  - Bid due date
  - Sender contact information
  - Email body text
- **Document Storage**: Store all attached PDF documents (plans, specifications, etc.) linked to the project

## 3. Document Parsing and Interrogation
- **User Interface**: Front-end interface for users to select a project and specific specification section (e.g., "Division 09 – Finishes")
- **Content Extraction**: Use PDF parsing and NLP techniques to extract relevant content from documents related to the chosen section
- **Content Highlighting**: Highlight or extract line items, quantities, product specifications, etc.

## 4. Cost Estimation and Proposal Generation
- **Cost Input**: Allow users to input or fetch unit costs from a database
- **Estimate Generation**: Generate detailed cost estimates based on parsed content
- **Proposal Creation**: Create formatted proposal documents (PDF) including:
  - Project details
  - Scope summary
  - Itemized estimate
  - Terms and conditions
  - Contractor contact information

## 5. Front-End Requirements
- **Dashboard**: Display list of projects and their status
- **Project Details**: Pages showing email summary, file list, and specification interrogation tools
- **User Interface**: Clean, modern UI using React (or similar)
- **PDF Handling**: Preview and highlighting capabilities for PDF documents

## 6. Back-End & Tech Stack
- **Backend Framework**: Python (FastAPI, Flask) or Node.js
- **Database**: PostgreSQL or SQLite for local data storage
- **Email Integration**: Gmail API
- **PDF Processing**: Libraries such as PyMuPDF, PDFMiner, or pdfplumber
- **Front-End Framework**: React, Vue, or similar
- **Document Storage**: Local file storage or document database for PDF attachments

## 7. Licensing and Deployment
- **License**: Open source (MIT, GPL, or similar)
- **Deployment**: Runnable on local server (e.g., Raspberry Pi, Docker container)
- **Documentation**: Clear installation steps and user guides

## Deliverables
- Full source code (GitHub or GitLab repository)
- Deployment guide
- User manual
- Example project data for testing
- Optional: Docker setup for easy deployment
