'use client';

// [R1] Comprehensive Admin Interface for Database Management
import { useState, useEffect } from 'react';
import { Database, Users, Briefcase, Building2, Star, Eye, Edit, Trash2, Plus, Save, X, Upload, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import VendorSyncPanel from '@/components/admin/VendorSyncPanel';

interface Vendor {
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  vendor_status: string;
  email: string;
  primary_contact: string;
  service_category: string;
  skills: string;
  pricing_structure: string;
  rate_cost: string;
  availability: string;
  time_zone: string;
  contact_preference: string;
  total_projects: number;
  rated_projects: number;
  avg_overall_rating: number | null;
  created_at: string;
  updated_at: string;
}

interface Client {
  client_id: string;
  client_name: string;
  contact_name: string;
  contact_email: string;
  industry: string;
  total_projects: number;
  time_zone: string;
  preferred_contact: string;
  client_notes: string;
  created_date: string;
  updated_at: string;
}

interface Project {
  project_id: string;
  vendor_name: string;
  submitted_by: string;
  project_title: string;
  client_company: string;
  status: string;
  project_success_rating: number | null;
  quality_rating: number | null;
  communication_rating: number | null;
  what_went_well: string | null;
  areas_for_improvement: string | null;
  recommend_vendor_again: boolean | null;
  recommendation_scope: string | null;
  project_overall_rating: number | null;
  vendor_id: string;
  created_at: string;
  updated_at: string;
}

// The Rating type is now effectively the same as a Project with ratings
type Rating = Project;

type TableType = 'vendors' | 'clients' | 'projects' | 'ratings' | 'import' | 'vendor-sync';
type ImportType = 'vendors' | 'project-only' | 'project-ratings';

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    imported: number;
    skipped: number;
    errors: string[];
  };
}


export default function AdminDashboard() {
  const [activeTable, setActiveTable] = useState<TableType>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Vendor | Client | Project | Rating | null>(null);

  // Import functionality state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<ImportType>('vendors');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Relationship repair state

  const [repairResult, setRepairResult] = useState<{ success: boolean, message: string } | null>(null);

  // Load data for active table
  useEffect(() => {
    if (activeTable !== 'import' && activeTable !== 'vendor-sync') {
      loadTableData();
    }
  }, [activeTable]);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/table-data?table=${activeTable}`);
      const data = await response.json();

      if (data.success) {
        switch (activeTable) {
          case 'vendors':
            setVendors(data.data);
            break;
          case 'clients':
            setClients(data.data);
            break;
          case 'projects':
            setProjects(data.data);
            break;
          case 'ratings':
            setRatings(data.data);
            break;
        }
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (item: Vendor | Client | Project | Rating) => {
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // Add a saving state
    setLoading(true);

    try {
      // Extract the primary key based on table type
      let primaryKey: string;
      switch (activeTable) {
        case 'vendors':
          primaryKey = (editingItem as Vendor).vendor_id;
          break;
        case 'clients':
          primaryKey = (editingItem as Client).client_id;
          break;
        case 'projects':
          primaryKey = (editingItem as Project).project_id;
          break;
        case 'ratings':
          primaryKey = (editingItem as Rating).project_id;
          break;
        default:
          console.error('Unknown table type:', activeTable);
          alert('Error: Unknown table type');
          setLoading(false);
          return;
      }

      console.log('Saving record:', { table: activeTable, id: primaryKey, data: editingItem });

      const response = await fetch(`/api/admin/update-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: activeTable,
          id: primaryKey,
          data: editingItem
        })
      });

      const responseData = await response.json();
      console.log('Save response:', responseData);

      if (response.ok) {
        setEditingItem(null);
        await loadTableData();
        // Show success message
        setRepairResult({
          success: true,
          message: `✅ ${activeTable === 'vendors' ? 'Vendor' : activeTable.slice(0, -1)} updated successfully`
        });
        // Clear message after 3 seconds
        setTimeout(() => setRepairResult(null), 3000);
      } else {
        console.error('Save failed:', responseData);
        alert(`Save failed: ${responseData.error || 'Unknown error'}\n\nDetails: ${responseData.details || 'No details available'}`);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert(`Error saving record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/admin/delete-record`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: activeTable,
          id
        })
      });

      if (response.ok) {
        loadTableData();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const renderVendorsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service Category</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {vendors.map((vendor) => (
            <tr key={vendor.vendor_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{vendor.vendor_name}</td>
              <td className="px-4 py-2 text-sm">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {vendor.vendor_type || 'Not Set'}
                </span>
              </td>
              <td className="px-4 py-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {vendor.service_category || 'Not Set'}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {vendor.total_projects} ({vendor.rated_projects} rated)
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {vendor.avg_overall_rating ? vendor.avg_overall_rating.toFixed(2) : '-'}
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="Edit vendor"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderClientsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Projects</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.client_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{client.client_name}</td>
              <td className="px-4 py-2 text-sm text-gray-600">{client.industry}</td>
              <td className="px-4 py-2 text-sm font-medium text-blue-600 bg-gray-50">{client.total_projects || 0}</td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {client.created_date ? new Date(client.created_date + 'T00:00:00').toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(client.client_id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProjectsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overall Rating</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.project_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {project.project_title}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {project.vendor_name}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {project.client_company}
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex items-center">
                  {project.project_overall_rating !== null && project.project_overall_rating !== undefined ? (
                    <>
                      <span className="font-bold text-lg text-green-600">
                        {project.project_overall_rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1 text-sm font-medium">/ 10</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm italic">No rating</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(project)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(project.project_id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRatingsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project Success Rating</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {ratings.map((rating) => (
            <tr key={rating.project_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {rating.project_title}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {rating.vendor_name}
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex items-center">
                  {rating.project_success_rating !== null && rating.project_success_rating !== undefined ? (
                    <>
                      <span className="font-bold text-base text-blue-600">
                        {rating.project_success_rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1 text-base font-medium">/ 10</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm italic">No rating assigned</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(rating)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(rating.project_id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Import functionality handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', importType);

    try {
      // Route to appropriate API based on import type
      const apiEndpoint = importType === 'vendors'
        ? '/api/import'
        : '/api/admin/csv-import';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setImportResult(data);
    } catch {
      setImportResult({
        success: false,
        message: 'Import failed. Please check your file and try again.',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (type: ImportType) => {
    const link = document.createElement('a');
    const templatePath = `/templates/${type.replace('-', '_')}_template.csv`;
    link.href = templatePath;
    link.download = `${type.replace('-', '_')}_template.csv`;
    link.click();
  };

  // Handle relationship repair

  const renderImportSection = () => (
    <div className="space-y-6">
      {/* Step 1: Download Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Download Templates</h3>
        <p className="text-sm text-gray-600 mb-4">Download and fill out the CSV templates with your data</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => downloadTemplate('vendors')}
            className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Vendors Template
          </button>
          <button
            onClick={() => downloadTemplate('project-only')}
            className="flex items-center justify-center gap-2 px-6 py-4 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Download size={16} />
            Project-Only Template
          </button>
          <button
            onClick={() => downloadTemplate('project-ratings')}
            className="flex items-center justify-center gap-2 px-6 py-4 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download size={16} />
            Project + Ratings Template
          </button>
        </div>
      </div>

      {/* Step 2: Select Import Type */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Select Import Type</h3>
        <p className="text-sm text-gray-600 mb-4">Choose what type of data you&apos;re importing</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['vendors', 'project-only', 'project-ratings'] as ImportType[]).map((type) => (
            <label key={type} className="cursor-pointer">
              <input
                type="radio"
                name="importType"
                value={type}
                checked={importType === type}
                onChange={(e) => setImportType(e.target.value as ImportType)}
                className="sr-only"
              />
              <div
                className={`p-6 rounded-lg border-2 transition-colors ${importType === type
                  ? (type === 'project-only' ? 'border-blue-500 bg-blue-50' :
                    type === 'project-ratings' ? 'border-green-500 bg-green-50' :
                      'border-blue-500 bg-blue-50')
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <h4 className="font-semibold capitalize">
                  {type === 'project-only' ? 'Projects Only' :
                    type === 'project-ratings' ? 'Projects + Ratings' :
                      type}
                </h4>
                <p className="text-sm text-gray-600">
                  {type === 'project-only' ? 'Import projects without ratings' :
                    type === 'project-ratings' ? 'Import projects with ratings' :
                      `Import ${type} data`}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 3: Upload File */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Upload File</h3>
        <p className="text-sm text-gray-600 mb-4">Select your filled CSV file to import</p>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-admin"
            />
            <label
              htmlFor="file-upload-admin"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500 mt-1">CSV files only</span>
            </label>
            {selectedFile && (
              <div className="mt-4 text-sm text-gray-600">
                Selected: {selectedFile.name}
              </div>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Import Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {importResult && (
        <div className={`border rounded-lg p-4 ${importResult.success
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50'
          }`}>
          <div className="flex items-start">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                {importResult.message}
              </p>
              {importResult.details && (
                <div className="mt-2 text-sm">
                  <p>Imported: {importResult.details.imported}</p>
                  <p>Skipped: {importResult.details.skipped}</p>
                  {importResult.details.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Errors:</p>
                      <ul className="list-disc list-inside">
                        {importResult.details.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );


  const renderEditModal = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">
              Edit {activeTable === 'vendors' ? 'Vendor' : activeTable.slice(0, -1)}
            </h2>
            <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">

            {/* Show primary key info but not editable */}
            {activeTable === 'vendors' && (editingItem as Vendor).vendor_id && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Vendor ID:</span> {(editingItem as Vendor).vendor_id}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {Object.entries(editingItem).map(([key, value]) => {
                // Skip non-editable fields for all tables
                const skipFields = [
                  'vendor_id', 'client_id', 'project_id', 'rating_id', // Primary keys
                  'created_at', 'updated_at', // Timestamps
                ];

                // For vendors, also skip calculated fields
                if (activeTable === 'vendors') {
                  const vendorCalculatedFields = [
                    'total_projects',
                    'rated_projects',
                    'avg_project_success_rating',
                    'avg_quality_rating',
                    'avg_communication_rating',
                    'avg_overall_rating',
                    'recommendation_percentage'
                  ];
                  if (vendorCalculatedFields.includes(key) || skipFields.includes(key)) return null;
                } else {
                  if (skipFields.includes(key)) return null;
                }

                // Special handling for text areas (long text fields)
                const textAreaFields = ['skills', 'notes', 'what_went_well', 'areas_for_improvement', 'contact_preference'];

                if (textAreaFields.includes(key)) {
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <textarea
                        value={value || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          [key]: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                      />
                    </div>
                  );
                }

                // Special handling for boolean fields
                if (typeof value === 'boolean' || key === 'recommend_vendor_again') {
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <select
                        value={value ? 'true' : 'false'}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          [key]: e.target.value === 'true'
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  );
                }

                // Regular input fields
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        [key]: typeof value === 'number' ? Number(e.target.value) : e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                    />
                  </div>
                );
              })}
            </div>

          </div>

          <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Database className="text-blue-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-500">
              Database Management & Configuration
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'vendors', label: 'Vendors', icon: Users, count: vendors.length },
                { key: 'clients', label: 'Clients', icon: Building2, count: clients.length },
                { key: 'projects', label: 'Projects', icon: Briefcase, count: projects.length },
                { key: 'ratings', label: 'Ratings', icon: Star, count: ratings.length },
                { key: 'import', label: 'Import Data', icon: Upload, count: null },
                { key: 'vendor-sync', label: 'Vendor Sync', icon: RefreshCw, count: null }
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTable(key as TableType)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTable === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                  {count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${key === 'taxonomy'
                      ? count < 25
                        ? 'bg-red-100 text-red-600'
                        : count < 75
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {key === 'taxonomy' ? `${count}%` : count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {activeTable} Management
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={loadTableData}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
                >
                  <Eye size={16} />
                  Refresh
                </button>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed flex items-center gap-2"
                  title="Add functionality coming soon"
                >
                  <Plus size={16} />
                  Add New
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Success/Error Messages */}
            {repairResult && (
              <div className={`mb-4 px-4 py-2 rounded-md text-sm ${repairResult.success
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                {repairResult.message}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTable === 'vendors' && renderVendorsTable()}
                {activeTable === 'clients' && renderClientsTable()}
                {activeTable === 'projects' && renderProjectsTable()}
                {activeTable === 'ratings' && renderRatingsTable()}
                {activeTable === 'import' && renderImportSection()}
                {activeTable === 'vendor-sync' && <VendorSyncPanel />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {renderEditModal()}
    </div>
  );
}
