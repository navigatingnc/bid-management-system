import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { documentApi } from '../lib/api';

interface DocumentViewerProps {
  documentId?: number;
}

interface TextPosition {
  text: string;
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const PDFViewer: React.FC<DocumentViewerProps> = ({ documentId }) => {
  const { id } = useParams<{ id: string }>();
  const docId = documentId || Number(id);
  
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [textPositions, setTextPositions] = useState<TextPosition[]>([]);
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [sectionContent, setSectionContent] = useState<string>('');
  const [sectionAnalysis, setAnalysis] = useState<any>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await documentApi.getDocument(docId);
        setDocument(data);
        
        // Set PDF URL for viewing
        setPdfUrl(documentApi.getDocumentDownloadUrl(docId));
        
        // Get document metadata including text sample
        const metadata = await documentApi.getDocumentMetadata(docId);
        setExtractedText(metadata.text_sample || '');
        
        setError(null);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (docId) {
      fetchDocument();
    }
  }, [docId]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    
    // Highlight text in the PDF viewer
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      
      // This is a simplified approach - in a real application, you would use PDF.js or a similar library
      // to properly search and highlight text in the PDF
      console.log(`Searching for: ${searchText}`);
      
      // Add the search term to highlighted text list
      if (!highlightedText.includes(searchText)) {
        setHighlightedText([...highlightedText, searchText]);
      }
    }
  };

  const handleExtractSection = async () => {
    if (!currentSection) return;
    
    try {
      setLoading(true);
      const result = await documentApi.extractDocumentSection(docId, currentSection);
      setSectionContent(result.text || 'No content found for this section.');
      setAnalysis(result.analysis || null);
      setError(null);
    } catch (err) {
      console.error('Error extracting section:', err);
      setError('Failed to extract section content. Please try again.');
      setSectionContent('');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFullText = async () => {
    try {
      setLoading(true);
      const result = await documentApi.extractDocumentText(docId);
      setExtractedText(result.text || 'No text could be extracted from this document.');
      setError(null);
    } catch (err) {
      console.error('Error extracting text:', err);
      setError('Failed to extract text from document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !document) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !document) {
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
        <h1 className="text-2xl font-bold">
          {document?.original_filename || document?.filename || 'Document Viewer'}
        </h1>
        <div>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => window.history.back()}
          >
            Back to Project
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Document Preview</h2>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search text..."
                  className="border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-r-md"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100">
              {pdfUrl ? (
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-[600px] border-0"
                  title="PDF Document Viewer"
                ></iframe>
              ) : (
                <div className="flex justify-center items-center h-[600px] bg-gray-200">
                  <p className="text-gray-500">No document to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold">Document Information</h2>
            </div>
            
            <div className="p-4">
              {document && (
                <div>
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Filename:</span>
                    <p className="font-medium">{document.original_filename || document.filename}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Type:</span>
                    <p className="font-medium capitalize">{document.document_type || 'Unknown'}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Size:</span>
                    <p className="font-medium">
                      {document.file_size ? `${Math.round(document.file_size / 1024)} KB` : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Uploaded:</span>
                    <p className="font-medium">
                      {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold">Extract Section</h2>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specification Section
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentSection}
                  onChange={(e) => setCurrentSection(e.target.value)}
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
              
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-full"
                onClick={handleExtractSection}
                disabled={!currentSection}
              >
                Extract Section
              </button>
              
              {loading && currentSection && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span>Extracting...</span>
                </div>
              )}
              
              {sectionContent && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">{currentSection}</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-sm overflow-auto max-h-64">
                    <pre className="whitespace-pre-wrap">{sectionContent}</pre>
                  </div>
                  
                  {sectionAnalysis && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Analysis</h3>
                      
                      {sectionAnalysis.quantities && sectionAnalysis.quantities.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Quantities:</h4>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {sectionAnalysis.quantities.map((qty: string, i: number) => (
                              <li key={i}>{qty}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {sectionAnalysis.materials && sectionAnalysis.materials.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Materials:</h4>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {sectionAnalysis.materials.map((material: string, i: number) => (
                              <li key={i} className="capitalize">{material}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Extracted Text</h2>
              <button
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                onClick={handleExtractFullText}
              >
                Extract Full Text
              </button>
            </div>
            
            <div className="p-4">
              {extractedText ? (
                <div className="bg-gray-50 p-3 rounded-md text-sm overflow-auto max-h-64">
                  <pre className="whitespace-pre-wrap">{extractedText}</pre>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No text extracted yet. Click "Extract Full Text" to process the document.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
