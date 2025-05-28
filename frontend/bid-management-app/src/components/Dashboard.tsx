import React, { useState, useEffect } from 'react';
import { projectApi } from '../lib/api';

interface Project {
  id: number;
  name: string;
  bid_due_date: string | null;
  sender_name: string | null;
  sender_email: string | null;
  created_at: string;
  updated_at: string;
  document_count: number;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectApi.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getBidStatusClass = (dateString: string | null) => {
    if (!dateString) return 'text-gray-500';
    
    const daysRemaining = getDaysRemaining(dateString);
    
    if (daysRemaining === null) return 'text-gray-500';
    if (daysRemaining < 0) return 'text-red-500';
    if (daysRemaining <= 3) return 'text-orange-500';
    if (daysRemaining <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bid Management Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
            </div>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              onClick={() => window.location.href = '/projects/new'}
            >
              New Project
            </button>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bid Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No projects found. Create a new project or process emails to get started.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const daysRemaining = getDaysRemaining(project.bid_due_date);
                    const statusClass = getBidStatusClass(project.bid_due_date);
                    
                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                            {project.name}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.sender_name ? (
                            <div>
                              <div>{project.sender_name}</div>
                              <div className="text-xs text-gray-400">{project.sender_email}</div>
                            </div>
                          ) : (
                            project.sender_email || 'Not specified'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={statusClass}>
                            {formatDate(project.bid_due_date)}
                            {daysRemaining !== null && (
                              <div className="text-xs">
                                {daysRemaining < 0 
                                  ? 'Overdue' 
                                  : daysRemaining === 0 
                                    ? 'Due today' 
                                    : `${daysRemaining} days remaining`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.document_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(project.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                            View
                          </a>
                          <a href={`/projects/${project.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Edit
                          </a>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this project?')) {
                                projectApi.deleteProject(project.id)
                                  .then(() => {
                                    setProjects(projects.filter(p => p.id !== project.id));
                                  })
                                  .catch(err => {
                                    console.error('Error deleting project:', err);
                                    alert('Failed to delete project. Please try again.');
                                  });
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Process Emails</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Process new emails from your Gmail account to automatically create projects from bid invitations.
              </p>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => window.location.href = '/emails/process'}
              >
                Process Emails
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
