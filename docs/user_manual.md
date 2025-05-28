# User Manual - Construction Bid Management System

## Overview

The Construction Bid Management System is an open-source application designed to streamline the intake and management of construction bid invitations received via email. This system connects to your Gmail account, processes bid emails and attachments, creates new projects, and assists in generating cost estimates and proposals.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Email Processing](#email-processing)
4. [Project Management](#project-management)
5. [Document Management](#document-management)
6. [Specification Interrogation](#specification-interrogation)
7. [Cost Estimation](#cost-estimation)
8. [Proposal Generation](#proposal-generation)

## Getting Started

### First-Time Setup

1. After installing the application (see Installation Guide), open your web browser and navigate to the application URL (typically http://localhost:3000 for local installations).
2. You'll be presented with the dashboard, which will initially be empty.
3. To connect your Gmail account, click on "Process Emails" in the navigation bar.
4. Follow the Google authentication prompts to grant the application access to your Gmail account.

## Dashboard

The dashboard is your central hub for managing all projects and activities.

### Features:

- **Project List**: View all your projects with key information including name, sender, bid due date, and document count.
- **Status Indicators**: Color-coded indicators show bid due date status (green for plenty of time, yellow for approaching, red for urgent/overdue).
- **Quick Actions**: Access common actions like viewing, editing, or deleting projects directly from the dashboard.
- **New Project**: Create new projects manually using the "New Project" button.
- **Process Emails**: Access the email processing feature to import bid invitations from Gmail.

## Email Processing

This feature allows you to automatically create projects from bid invitation emails in your Gmail account.

### How to Process Emails:

1. Click "Process Emails" in the navigation bar or on the dashboard.
2. If not already authenticated, follow the Google OAuth prompts.
3. The system will search for emails matching bid invitation criteria (configurable search terms).
4. Review the found emails and select which ones to process.
5. The system will create new projects from selected emails, extracting:
   - Project name (from email subject)
   - Bid due date (automatically detected in email content)
   - Sender information
   - Email content
   - PDF attachments

## Project Management

Each project contains all information related to a specific bid invitation.

### Project Details:

- **Overview Tab**: View basic project information, including project details and email information.
- **Documents Tab**: Access all documents associated with the project.
- **Specifications Tab**: Interrogate specification documents for detailed content.
- **Estimates Tab**: Create and manage cost estimates for the project.
- **Proposals Tab**: Generate formal proposals based on estimates.

### Actions:

- **Edit Project**: Modify project details such as name, bid due date, etc.
- **Delete Project**: Remove a project and all associated data.
- **Create Estimate**: Start a new cost estimate for the project.
- **Create Proposal**: Generate a new proposal document.

## Document Management

The document management system allows you to organize and access all files related to a project.

### Features:

- **Document Upload**: Add new documents to a project.
- **Document Types**: Automatically categorizes documents (plans, specifications, addenda, etc.).
- **Document Preview**: View PDF documents directly in the browser.
- **Download**: Download original documents as needed.

## Specification Interrogation

This powerful feature helps you extract and analyze content from specification documents.

### How to Use:

1. Navigate to a project's "Specifications" tab or open a document in the PDF viewer.
2. Select a specification section (e.g., "Division 09 – Finishes").
3. Click "Extract Content" to retrieve the relevant section.
4. The system will:
   - Display the extracted text
   - Highlight key information
   - Identify quantities and materials
   - Provide analysis to assist with estimation

## Cost Estimation

Create detailed cost estimates for your projects with line-item breakdowns.

### Creating an Estimate:

1. From a project page, click "Create Estimate".
2. Enter a name and description for the estimate.
3. Add line items with:
   - Description
   - Quantity
   - Unit (e.g., SF, LF, EA)
   - Unit Cost
4. The system automatically calculates the total cost for each item and the overall estimate.
5. Add notes to line items as needed.
6. Save the estimate when complete.

### Managing Estimates:

- View all estimates for a project in the "Estimates" tab.
- Edit existing estimates as needed.
- Use estimates as the basis for formal proposals.

## Proposal Generation

Create professional proposals based on your cost estimates.

### Creating a Proposal:

1. From a project page, click "Create Proposal".
2. Select an estimate to base the proposal on (optional).
3. Enter a title for the proposal.
4. Provide a scope summary describing the work.
5. Review and modify the terms and conditions as needed.
6. Preview the proposal to see how it will appear.
7. Generate a PDF version for distribution.
8. Save the proposal to the project.

### Proposal Features:

- Professional formatting with company information
- Project and client details
- Detailed scope of work
- Itemized cost breakdown (if based on an estimate)
- Terms and conditions
- Signature lines for acceptance

## Tips and Best Practices

- **Regular Email Processing**: Check for new bid invitations regularly to ensure timely responses.
- **Document Organization**: Upload and properly categorize all project documents for easier reference.
- **Specification Analysis**: Use the specification interrogation tools to quickly identify key requirements and quantities.
- **Estimate Accuracy**: Break down estimates into detailed line items for greater accuracy.
- **Proposal Customization**: Tailor the scope summary and terms for each specific project.
