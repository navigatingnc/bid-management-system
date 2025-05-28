import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../lib/api';

interface EstimateFormProps {
  projectId?: number;
}

interface EstimateItem {
  id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  notes: string;
}

const EstimateForm: React.FC<EstimateFormProps> = ({ projectId: propProjectId }) => {
  const { id } = useParams<{ id: string }>();
  const projectId = propProjectId || Number(id);
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estimateName, setEstimateName] = useState<string>('');
  const [estimateDescription, setEstimateDescription] = useState<string>('');
  const [items, setItems] = useState<EstimateItem[]>([
    { description: '', quantity: 0, unit: '', unit_cost: 0, total_cost: 0, notes: '' }
  ]);
  const [totalEstimate, setTotalEstimate] = useState<number>(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectApi.getProject(projectId);
        setProject(data);
        
        // Set default estimate name
        setEstimateName(`${data.name} - Estimate`);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    // Calculate total estimate whenever items change
    const total = items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
    setTotalEstimate(total);
  }, [items]);

  const handleItemChange = (index: number, field: keyof EstimateItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total cost if quantity or unit cost changes
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitCost = field === 'unit_cost' ? value : updatedItems[index].unit_cost;
      updatedItems[index].total_cost = quantity * unitCost;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 0, unit: '', unit_cost: 0, total_cost: 0, notes: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      // Don't remove the last item, just clear it
      const clearedItem = { description: '', quantity: 0, unit: '', unit_cost: 0, total_cost: 0, notes: '' };
      setItems([clearedItem]);
    } else {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!estimateName.trim()) {
      alert('Please enter an estimate name');
      return;
    }
    
    if (items.some(item => !item.description.trim())) {
      alert('Please enter a description for all items');
      return;
    }
    
    // Prepare estimate data
    const estimateData = {
      project_id: projectId,
      name: estimateName,
      description: estimateDescription,
      total_cost: totalEstimate,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        notes: item.notes
      }))
    };
    
    try {
      setLoading(true);
      // This would be an API call to save the estimate
      console.log('Saving estimate:', estimateData);
      
      // Redirect to project page after successful save
      window.location.href = `/projects/${projectId}`;
    } catch (err) {
      console.error('Error saving estimate:', err);
      alert('Failed to save estimate. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold">Create Estimate</h1>
        <div>
          <button 
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded mr-2"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Save Estimate
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Estimate Information</h2>
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
                  Estimate Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={estimateName}
                  onChange={(e) => setEstimateName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={estimateDescription}
                onChange={(e) => setEstimateDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Line Items</h2>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded text-sm"
                onClick={addItem}
              >
                Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description *
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          placeholder="ea, sf, lf"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md py-1 pl-6 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={item.unit_cost || ''}
                            onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">$</span>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md py-1 pl-6 pr-2 text-sm bg-gray-100 cursor-not-allowed"
                            value={item.total_cost.toFixed(2)}
                            readOnly
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.notes}
                          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-3 py-3 text-right font-medium">
                      Total Estimate:
                    </td>
                    <td className="px-3 py-3 font-medium">
                      ${totalEstimate.toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;
