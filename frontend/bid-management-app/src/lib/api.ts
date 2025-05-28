import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Project API endpoints
export const projectApi = {
  // Get all projects
  getProjects: async () => {
    const response = await axios.get(`${API_BASE_URL}/projects/`);
    return response.data;
  },
  
  // Get a specific project by ID
  getProject: async (projectId) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
    return response.data;
  },
  
  // Create a new project
  createProject: async (projectData) => {
    const response = await axios.post(`${API_BASE_URL}/projects/`, projectData);
    return response.data;
  },
  
  // Update an existing project
  updateProject: async (projectId, projectData) => {
    const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, projectData);
    return response.data;
  },
  
  // Delete a project
  deleteProject: async (projectId) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
    return response.data;
  },
  
  // Get project summary
  getProjectSummary: async (projectId) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/summary`);
    return response.data;
  },
  
  // Get project documents
  getProjectDocuments: async (projectId) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/documents`);
    return response.data;
  }
};

// Document API endpoints
export const documentApi = {
  // Get all documents
  getDocuments: async (projectId = null) => {
    const url = projectId 
      ? `${API_BASE_URL}/documents/?project_id=${projectId}`
      : `${API_BASE_URL}/documents/`;
    const response = await axios.get(url);
    return response.data;
  },
  
  // Get a specific document by ID
  getDocument: async (documentId) => {
    const response = await axios.get(`${API_BASE_URL}/documents/${documentId}`);
    return response.data;
  },
  
  // Upload a new document
  uploadDocument: async (projectId, file, documentType = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (documentType) {
      formData.append('document_type', documentType);
    }
    
    const response = await axios.post(`${API_BASE_URL}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Update document metadata
  updateDocument: async (documentId, documentData) => {
    const response = await axios.put(`${API_BASE_URL}/documents/${documentId}`, documentData);
    return response.data;
  },
  
  // Delete a document
  deleteDocument: async (documentId) => {
    const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
    return response.data;
  },
  
  // Get document download URL
  getDocumentDownloadUrl: (documentId) => {
    return `${API_BASE_URL}/documents/${documentId}/download`;
  },
  
  // Extract text from document
  extractDocumentText: async (documentId) => {
    const response = await axios.get(`${API_BASE_URL}/proposals/document/${documentId}/extract`);
    return response.data;
  },
  
  // Extract section from document
  extractDocumentSection: async (documentId, sectionName) => {
    const response = await axios.get(
      `${API_BASE_URL}/proposals/document/${documentId}/section?section=${encodeURIComponent(sectionName)}`
    );
    return response.data;
  },
  
  // Get document metadata
  getDocumentMetadata: async (documentId) => {
    const response = await axios.get(`${API_BASE_URL}/proposals/document/${documentId}/metadata`);
    return response.data;
  }
};

// Email API endpoints
export const emailApi = {
  // Check authentication status
  checkAuth: async () => {
    const response = await axios.get(`${API_BASE_URL}/email/check`);
    return response.data;
  },
  
  // Process new emails
  processEmails: async (email, query = null, maxResults = 10) => {
    const data = {
      email,
      query,
      max_results: maxResults
    };
    const response = await axios.post(`${API_BASE_URL}/email/process`, data);
    return response.data;
  },
  
  // Get email details
  getEmailDetails: async (messageId, email) => {
    const response = await axios.get(`${API_BASE_URL}/email/email/${messageId}?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  
  // Get authentication URL
  getAuthUrl: () => {
    return `${API_BASE_URL}/email/auth`;
  }
};
