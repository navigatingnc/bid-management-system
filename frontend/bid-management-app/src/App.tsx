import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import PDFViewer from './components/PDFViewer';
import EstimateForm from './components/EstimateForm';
import ProposalForm from './components/ProposalForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">
              <a href="/">Construction Bid Management</a>
            </h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <a href="/" className="text-gray-600 hover:text-blue-600">Dashboard</a>
                </li>
                <li>
                  <a href="/emails/process" className="text-gray-600 hover:text-blue-600">Process Emails</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/projects/:projectId/documents/:id/view" element={<PDFViewer />} />
            <Route path="/projects/:projectId/estimate/new" element={<EstimateForm />} />
            <Route path="/projects/:projectId/proposal/new" element={<ProposalForm />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Material Supply Contractor | Construction Bid Management System
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
