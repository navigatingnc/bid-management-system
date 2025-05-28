import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi, documentApi } from '../lib/api';

interface Project {
  id: number;
  name: string;
  bid_due_date: string | null;
  sender_name: string | null;
  sender_email: string | null;
  email_subject: string | null;
  email_body: string | null;
  created_at: string;
  updated_at: string;
  document_counts: Record<string, number>;
  estimate_count: number;
  proposal_count: number;
}

interface Document {
  id: number;
  project_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  created_at: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectData = await projectApi.getProjectSummary(Number(projectId));
        setProject(projectData);
        
        const documentsData = await projectApi.getProjectDocuments(Number(projectId));
        setDocuments(documentsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploadingFile(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await documentApi.uploadDocument(Number(projectId), file);
      }
      
      // Refresh documents list
      const documentsData = await projectApi.getProjectDocuments(Number(projectId));
      setDocuments(documentsData);
      
      // Reset file input
      event.target.value = '';
      
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await documentApi.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error || 'Project not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mr-2"
            onClick={() => window.location.href = `/projects/${projectId}/edit`}
          >
            Edit Project
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => window.location.href = `/projects/${projectId}/estimate`}
          >
            Create Estimate
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({documents.length})
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'specifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'estimates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('estimates')}
            >
              Estimates ({project.estimate_count})
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'proposals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('proposals')}
            >
              Proposals ({project.proposal_count})
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Project Name:</span>
                      <p className="font-medium">{project.name}</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Bid Due Date:</span>
                      <p className="font-medium">{formatDate(project.bid_due_date)}</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Sender:</span>
                      <p className="font-medium">
                        {project.sender_name && (
                          <>
                            {project.sender_name}
                            <br />
                            <span className="text-gray-400 text-sm">{project.sender_email}</span>
                          </>
                        )}
                        {!project.sender_name && project.sender_email}
                        {!project.sender_name && !project.sender_email && 'Not specified'}
                      </p>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Created:</span>
                      <p className="font-medium">{formatDate(project.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Last Updated:</span>
                      <p className="font-medium">{formatDate(project.updated_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Email Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {project.email_subject ? (
                      <>
                        <div className="mb-3">
                          <span className="text-gray-500 text-sm">Subject:</span>
                          <p className="font-medium">{project.email_subject}</p>
                        </div>
                        {project.email_body && (
                          <div>
                            <span className="text-gray-500 text-sm">Body:</span>
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md text-sm overflow-auto max-h-48">
                              <pre className="whitespace-pre-wrap">{project.email_body}</pre>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">No email information available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Documents</h2>
                <div>
                  <label className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded cursor-pointer">
                    Upload Document
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      multiple
                      disabled={uploadingFile}
                    />
                  </label>
                </div>
              </div>
              
              {uploadingFile && (
                <div className="mb-4 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span>Uploading...</span>
                </div>
              )}
              
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No documents uploaded yet.</p>
                  <p className="mt-2 text-sm">Upload documents using the button above.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Filename
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a 
                              href={documentApi.getDocumentDownloadUrl(doc.id)} 
                              className="text-blue-600 hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {doc.original_filename || doc.filename}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {doc.document_type || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(doc.file_size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(doc.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a 
                              href={`/projects/${projectId}/documents/${doc.id}/view`}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Specification Interrogation</h2>
              
              {documents.filter(doc => doc.document_type === 'specifications').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No specification documents found.</p>
                  <p className="mt-2 text-sm">Upload specification documents to use this feature.</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-4">
                    Select a specification document and section to extract relevant content.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specification Document
                      </label>
                      <select 
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a document</option>
                        {documents
                          .filter(doc => doc.document_type === 'specifications')
                          .map(doc => (
                            <option key={doc.id} value={doc.id}>
                              {doc.original_filename || doc.filename}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specification Section
                      </label>
                      <select 
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a section</option>
                        <option value="Division 01 - General Requirements">Division 01 - General Requirements</option>
                        <option value="Division 02 - Existing Conditions">Division 02 - Existing Conditions</option>
                        <option value="Division 03 - Concrete">Division 03 - Concrete</option>
                        <option value="Division 04 - Masonry">Division 04 - Masonry</option>
                        <option value="Division 05 - Metals">Division 05 - Metals</option>
                        <option value="Division 06 - Wood, Plastics, and Composites">Division 06 - Wood, Plastics, and Composites</option>
                        <option value="Division 07 - Thermal and Moisture Protection">Division 07 - Thermal and Moisture Protection</option>
                        <option value="Division 08 - Openings">Division 08 - Openings</option>
                        <option value="Division 09 - Finishes">Division 09 - Finishes</option>
                        <option value="Division 10 - Specialties">Division 10 - Specialties</option>
                        <option value="Division 11 - Equipment">Division 11 - Equipment</option>
                        <option value="Division 12 - Furnishings">Division 12 - Furnishings</option>
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Extract Content
                  </button>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Extracted Content</h3>
                    <div className="bg-white border border-gray-200 rounded-md p-4 min-h-[200px]">
                      <p className="text-gray-500 text-center">
                        Select a document and section to extract content.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'estimates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Estimates</h2>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  onClick={() => window.location.href = `/projects/${projectId}/estimate/new`}
                >
                  Create New Estimate
                </button>
              </div>
              
              {project.estimate_count === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No estimates created yet.</p>
                  <p className="mt-2 text-sm">Create a new estimate using the button above.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <p className="p-4 text-gray-500">Estimate list will appear here.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'proposals' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Proposals</h2>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  onClick={() => window.location.href = `/projects/${projectId}/proposal/new`}
                >
                  Create New Proposal
                </button>
              </div>
              
              {project.proposal_count === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No proposals created yet.</p>
                  <p className="mt-2 text-sm">Create a new proposal using the button above.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <p className="p-4 text-gray-500">Proposal list will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
