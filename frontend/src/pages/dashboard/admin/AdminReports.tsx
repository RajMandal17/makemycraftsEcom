

import React, { useState } from 'react';
import { adminAPI } from '../../../services/adminAPI';
import { toast } from 'react-toastify';
import { FileText, Download, Clock, CheckCircle } from 'lucide-react';

export type ReportType = 'SALES' | 'USER_ACTIVITY' | 'ARTWORK_PERFORMANCE' | 'REVENUE';
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';

interface ReportHistory {
  id: string;
  type: string;
  format: string;
  generatedAt: string;
  downloadUrl: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('SALES');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF');
  const [startDate, setStartDate] = useState<string>(() => {
    
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0] || '';
  });
  const [endDate, setEndDate] = useState<string>(() => {
    
    return new Date().toISOString().split('T')[0] || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const reportHistory: ReportHistory[] = [];

  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  const handleGenerateReport = async () => {
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsGenerating(true);

    try {
      const reportId = await adminAPI.generateReport({
        type: reportType,
        format: reportFormat,
        startDate,
        endDate,
      });

      toast.success('Report generated successfully!');

      
      await handleDownloadReport(reportId);

      
      

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  
  const handleDownloadReport = async (reportId: string) => {
    try {
      const blob = await adminAPI.downloadReport(reportId);
      
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      
      const extension = reportFormat.toLowerCase();
      const filename = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.${extension}`;
      link.download = filename;
      
      
      document.body.appendChild(link);
      link.click();
      
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast.error(error.message || 'Failed to download report');
    }
  };

  
  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'PDF':
        return <FileText className="text-red-500" />;
      case 'EXCEL':
        return <FileText className="text-green-500" />;
      case 'CSV':
        return <FileText className="text-blue-500" />;
      default:
        return null;
    }
  };

  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center text-green-600">
            <CheckCircle className="mr-1" size={16} /> Completed
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center text-yellow-600">
            <Clock className="mr-1" size={16} /> Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center text-red-600">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Generate New Report</h2>

          {}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SALES">Sales Report</option>
              <option value="USER_ACTIVITY">User Activity Report</option>
              <option value="ARTWORK_PERFORMANCE">Artwork Performance Report</option>
              <option value="REVENUE">Revenue Report</option>
            </select>
          </div>

          {}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Report Format
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setReportFormat('PDF')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-colors ${
                  reportFormat === 'PDF'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <FileText className="mr-2" size={16} /> PDF
              </button>
              <button
                onClick={() => setReportFormat('EXCEL')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-colors ${
                  reportFormat === 'EXCEL'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <FileText className="mr-2" size={16} /> Excel
              </button>
              <button
                onClick={() => setReportFormat('CSV')}
                className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-colors ${
                  reportFormat === 'CSV'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <FileText className="mr-2" size={16} /> CSV
              </button>
            </div>
          </div>

          {}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <Clock className="animate-spin mr-2" size={16} />
                Generating Report...
              </span>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Reports</h2>

          {reportHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reports generated yet</p>
              <p className="text-sm mt-2">Generate your first report to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportHistory.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getFormatIcon(report.format as ReportFormat)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {report.type.replace('_', ' ')} Report
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(report.generatedAt).toLocaleString()}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                  </div>

                  {report.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="mr-2" size={16} />
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Report Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900">Sales Report</h4>
            <p className="text-sm text-blue-700">
              Detailed breakdown of sales by date, category, and artist
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">User Activity Report</h4>
            <p className="text-sm text-blue-700">
              User registration trends, login patterns, and engagement metrics
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Artwork Performance Report</h4>
            <p className="text-sm text-blue-700">
              Top-selling artworks, views, favorites, and conversion rates
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Revenue Report</h4>
            <p className="text-sm text-blue-700">
              Revenue breakdown by time period, payment method, and category
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
