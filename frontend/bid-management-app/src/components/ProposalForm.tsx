import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../lib/api';

interface ProposalFormProps {
  projectId?: number;
  estimateId?: number;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ projectId: propProjectId, estimateId: propEstimateId }) => {
  const { projectId, estimateId } = useParams<{ projectId: string, estimateId: string }>();
  const pId = propProjectId || Number(projectId);
  const eId = propEstimateId || (estimateId ? Number(estimateId) : undefined);
  
  const [project, setProject] = useState<any>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [scopeSummary, setScopeSummary] = useState<string>('');
  const [termsConditions, setTermsConditions] = useState<string>(
    'Payment Terms: Net 30 days from invoice date.\n' +
    'Validity: This proposal is valid for 30 days from the date of issue.\n' +
    'Changes: Any changes to the scope of work may result in price adjustments.\n' +
    'Acceptance: Signature below indicates acceptance of this proposal.'
  );
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project data
        const projectData = await projectApi.getProject(pId);
        setProject(projectData);
        
        // Set default proposal title
        setTitle(`${projectData.name} - Proposal`);
        
        // If estimate ID is provided, fetch estimate data
        if (eId) {
          // This would be an API call to get estimate data
          // const estimateData = await estimateApi.getEstimate(eId);
          // setEstimate(estimateData);
          
          // For now, we'll use mock data
          setEstimate({
            id: eId,
            name: 'Sample Estimate',
            description: 'Sample estimate description',
            total_cost: 12500.75,
            items: [
              { description: 'Material Supply', quantity: 1, unit: 'lot', unit_cost: 7500, total_cost: 7500 },
              { description: 'Labor', quantity: 40, unit: 'hours', unit_cost: 125, total_cost: 5000 },
              { description: 'Equipment Rental', quantity: 1, unit: 'day', unit_cost: 750, total_cost: 750 }
            ]
          });
          
          // Set default scope summary based on estimate
          setScopeSummary('This proposal includes the following scope of work:\n\n' +
            '- Supply of all materials as specified\n' +
            '- Labor for installation\n' +
            '- Equipment rental\n' +
            '- Project management and supervision\n\n' +
            'All work to be completed according to industry standards and local building codes.'
          );
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (pId) {
      fetchData();
    }
  }, [pId, eId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      alert('Please enter a proposal title');
      return;
    }
    
    // Prepare proposal data
    const proposalData = {
      project_id: pId,
      estimate_id: eId,
      title,
      scope_summary: scopeSummary,
      terms_conditions: termsConditions
    };
    
    try {
      setLoading(true);
      // This would be an API call to save the proposal
      console.log('Saving proposal:', proposalData);
      
      // Redirect to project page after successful save
      window.location.href = `/projects/${pId}`;
    } catch (err) {
      console.error('Error saving proposal:', err);
      alert('Failed to save proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !project) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{previewMode ? 'Proposal Preview' : 'Create Proposal'}</h1>
        <div>
          {previewMode ? (
            <>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded mr-2"
                onClick={() => setPreviewMode(false)}
              >
                Edit
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded mr-2"
                onClick={() => alert('Generating PDF...')}
              >
                Generate PDF
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={handleSubmit}
              >
                Save Proposal
              </button>
            </>
          ) : (
            <>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded mr-2"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setPreviewMode(true)}
              >
                Preview
              </button>
            </>
          )}
        </div>
      </div>
      
      {previewMode ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-8 max-w-4xl mx-auto">
            {/* Company Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Material Supply Contractor</h1>
              <p className="text-gray-600">123 Construction Way, Building City, ST 12345</p>
              <p className="text-gray-600">Phone: (555) 123-4567 | Email: info@materialsupply.com</p>
            </div>
            
            {/* Proposal Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">
                {title}
              </h2>
            </div>
            
            {/* Project and Client Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Project Information</h3>
                <p><span className="font-medium">Project Name:</span> {project.name}</p>
                <p><span className="font-medium">Proposal Date:</span> {formatDate(new Date().toISOString())}</p>
                <p><span className="font-medium">Bid Due Date:</span> {formatDate(project.bid_due_date)}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Client Information</h3>
                <p><span className="font-medium">Client:</span> {project.sender_name || 'Not specified'}</p>
                <p><span className="font-medium">Email:</span> {project.sender_email || 'Not specified'}</p>
              </div>
            </div>
            
            {/* Scope of Work */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Scope of Work</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {scopeSummary}
              </div>
            </div>
            
            {/* Cost Estimate */}
            {estimate && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Cost Estimate</h3>
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left border-b border-gray-200">Description</th>
                      <th className="px-4 py-2 text-left border-b border-gray-200">Quantity</th>
                      <th className="px-4 py-2 text-left border-b border-gray-200">Unit</th>
                      <th className="px-4 py-2 text-left border-b border-gray-200">Unit Cost</th>
                      <th className="px-4 py-2 text-left border-b border-gray-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.items.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border-b border-gray-200">{item.description}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{item.quantity}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{item.unit}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{formatCurrency(item.unit_cost)}</td>
                        <td className="px-4 py-2 border-b border-gray-200">{formatCurrency(item.total_cost)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                      <td className="px-4 py-2">{formatCurrency(estimate.total_cost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Terms and Conditions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {termsConditions}
              </div>
            </div>
            
            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div>
                <p className="font-medium mb-8">Accepted By:</p>
                <div className="border-t border-gray-400 pt-2">
                  <p>Client Signature</p>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
              </div>
              <div>
                <p className="font-medium mb-8">Submitted By:</p>
                <div className="border-t border-gray-400 pt-2">
                  <p>Material Supply Contractor</p>
                  <p className="text-sm text-gray-600">Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Proposal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed"
                    value={project?.name || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposal Title *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {estimate && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Based on Estimate
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed"
                    value={`${estimate.name} (${formatCurrency(estimate.total_cost)})`}
                    disabled
                  />
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Summary *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={8}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms and Conditions *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalForm;
