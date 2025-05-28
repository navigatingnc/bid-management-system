# Testing Plan for Construction Bid Management System

## 1. Backend API Testing

### Email Integration
- [ ] Test OAuth2 authentication flow with Gmail
- [ ] Verify email retrieval with different search criteria
- [ ] Confirm attachment download and storage
- [ ] Test error handling for authentication failures

### Project Management
- [ ] Test project creation (manual and from email)
- [ ] Verify project update functionality
- [ ] Test project deletion with cascade to related records
- [ ] Confirm project listing and filtering

### Document Management
- [ ] Test document upload functionality
- [ ] Verify document download
- [ ] Test document metadata updates
- [ ] Confirm document deletion with file removal

### PDF Processing
- [ ] Test text extraction from various PDF types
- [ ] Verify section extraction functionality
- [ ] Test content highlighting
- [ ] Confirm metadata extraction

### Cost Estimation
- [ ] Test estimate creation with multiple line items
- [ ] Verify calculation accuracy
- [ ] Test estimate updates
- [ ] Confirm estimate deletion

### Proposal Generation
- [ ] Test proposal creation from estimates
- [ ] Verify PDF generation with proper formatting
- [ ] Test proposal updates
- [ ] Confirm proposal deletion

## 2. Frontend Testing

### Dashboard
- [ ] Verify project listing and sorting
- [ ] Test project creation form
- [ ] Confirm email processing button functionality
- [ ] Test responsive design on different screen sizes

### Project Detail Pages
- [ ] Test tab navigation
- [ ] Verify document listing and upload
- [ ] Confirm specification interrogation interface
- [ ] Test estimate and proposal creation buttons

### PDF Viewer
- [ ] Test document loading and display
- [ ] Verify text search functionality
- [ ] Test section extraction interface
- [ ] Confirm content highlighting

### Estimate Form
- [ ] Test line item addition and removal
- [ ] Verify calculation accuracy
- [ ] Test form validation
- [ ] Confirm save functionality

### Proposal Form
- [ ] Test form input and validation
- [ ] Verify preview mode
- [ ] Test PDF generation
- [ ] Confirm save functionality

## 3. End-to-End Testing

### Email to Project Workflow
- [ ] Test complete flow from email processing to project creation
- [ ] Verify document extraction and storage
- [ ] Confirm metadata extraction

### Project to Proposal Workflow
- [ ] Test complete flow from project creation to proposal generation
- [ ] Verify document interrogation
- [ ] Test estimate creation
- [ ] Confirm proposal generation and PDF export

### Error Handling
- [ ] Test system behavior with invalid inputs
- [ ] Verify error messages are clear and helpful
- [ ] Confirm system recovery from error states

## 4. Security Testing

- [ ] Verify OAuth2 token storage security
- [ ] Test API endpoint authorization
- [ ] Confirm file upload security measures
- [ ] Check for proper error handling without information leakage
