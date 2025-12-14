import React, { useState } from 'react';
import { 
  JobRoleImpact, 
  GeneratedInsight, 
  AnalysisContext 
} from '../types';
import { exportAnalysisData, generateShareableLink } from '../data/sampleData';
import './DataExport.css';

interface DataExportProps {
  selectedRoles: string[];
  timeRange: [Date, Date];
  impactScores: JobRoleImpact[];
  insights: GeneratedInsight[];
  viewMode: string;
  comparisonRole?: string;
}

export const DataExport: React.FC<DataExportProps> = ({
  selectedRoles,
  timeRange,
  impactScores,
  insights,
  viewMode,
  comparisonRole
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [shareableLink, setShareableLink] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExport = () => {
    const exportData = exportAnalysisData(selectedRoles, timeRange, impactScores, insights);
    
    switch (exportFormat) {
      case 'json':
        downloadJSON(exportData);
        break;
      case 'csv':
        downloadCSV(exportData);
        break;
      case 'pdf':
        // For demo purposes, we'll just download JSON
        // In a real implementation, you'd use a PDF library
        downloadJSON(exportData);
        break;
    }
  };

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workforce-impact-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any) => {
    // Convert impact scores to CSV format
    const headers = ['Role ID', 'AI Growth Rate', 'Job Demand Change', 'Impact Score', 'Risk Level', 'Classification'];
    const csvContent = [
      headers.join(','),
      ...data.impactAnalysis.map((impact: JobRoleImpact) => [
        impact.roleId,
        impact.aiGrowthRate,
        impact.jobDemandChange,
        impact.impactScore,
        impact.riskLevel,
        impact.classification
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workforce-impact-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateLink = () => {
    const link = generateShareableLink(selectedRoles, timeRange, viewMode, comparisonRole);
    setShareableLink(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="export-trigger-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open export options"
      >
        <span aria-hidden="true">📤</span> Export
      </button>
    );
  }

  return (
    <div className="data-export-modal">
      <div className="export-overlay" onClick={() => setIsOpen(false)} />
      
      <div className="export-dialog" role="dialog" aria-labelledby="export-title">
        <div className="export-header">
          <h3 id="export-title">Export Analysis</h3>
          <button 
            className="export-close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close export dialog"
          >
            ×
          </button>
        </div>
        
        <div className="export-content">
          {/* Export Data Section */}
          <div className="export-section">
            <h4>Download Data</h4>
            <p className="export-description">
              Export your current analysis including impact scores, insights, and metadata.
            </p>
            
            <div className="format-selector">
              <label>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json')}
                />
                <span className="format-option">
                  <strong>JSON</strong>
                  <small>Complete data with metadata</small>
                </span>
              </label>
              
              <label>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                />
                <span className="format-option">
                  <strong>CSV</strong>
                  <small>Impact scores for spreadsheet analysis</small>
                </span>
              </label>
              
              <label>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf')}
                />
                <span className="format-option">
                  <strong>PDF</strong>
                  <small>Formatted report (coming soon)</small>
                </span>
              </label>
            </div>
            
            <button 
              className="export-button export-button-primary"
              onClick={handleExport}
              disabled={exportFormat === 'pdf'}
            >
              <span aria-hidden="true">💾</span> Download {exportFormat.toUpperCase()}
            </button>
          </div>
          
          {/* Share Link Section */}
          <div className="export-section">
            <h4>Share Analysis</h4>
            <p className="export-description">
              Generate a shareable link to your current analysis view.
            </p>
            
            {!shareableLink ? (
              <button 
                className="export-button export-button-secondary"
                onClick={handleGenerateLink}
              >
                <span aria-hidden="true">🔗</span> Generate Link
              </button>
            ) : (
              <div className="shareable-link-container">
                <div className="link-display">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="link-input"
                    aria-label="Shareable link"
                  />
                  <button 
                    className="copy-button"
                    onClick={handleCopyLink}
                    aria-label="Copy link to clipboard"
                  >
                    {copySuccess ? (
                      <span aria-hidden="true">✓</span>
                    ) : (
                      <span aria-hidden="true">📋</span>
                    )}
                  </button>
                </div>
                
                {copySuccess && (
                  <div className="copy-success" role="status" aria-live="polite">
                    Link copied to clipboard!
                  </div>
                )}
                
                <div className="link-info">
                  <small>
                    This link includes your current role selection, time range, and view mode.
                  </small>
                </div>
              </div>
            )}
          </div>
          
          {/* Export Summary */}
          <div className="export-summary">
            <h4>Export Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Selected Roles:</span>
                <span className="summary-value">
                  {selectedRoles.length > 0 ? selectedRoles.length : 'None'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Time Range:</span>
                <span className="summary-value">
                  {timeRange[0].toLocaleDateString()} - {timeRange[1].toLocaleDateString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Impact Scores:</span>
                <span className="summary-value">{impactScores.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Insights:</span>
                <span className="summary-value">{insights.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="export-footer">
          <button 
            className="export-button export-button-secondary"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExport;