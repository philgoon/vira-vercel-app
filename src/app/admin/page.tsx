'use client';

// [R1] Comprehensive Admin Interface for Database Management
import { useState, useEffect } from 'react';
import { Database, Users, Briefcase, Building2, Star, Eye, Edit, Trash2, Plus, Save, X, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface Vendor {
  vendor_id: string;
  vendor_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  time_zone: string;
  service_categories: string[];
  hourly_rate: number;
  availability: string;
  bio: string;
  created_at: string;
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
  project_title: string;
  project_name?: string;
  client_id: string;
  client_name: string;
  project_type: string;
  budget: number;
  status: string;
  expected_deadline: string;
  created_at: string;
}

interface Rating {
  rating_id: string;
  project_id: string;
  vendor_id: string;
  project_name?: string;
  vendor_name?: string;
  projects?: {
    project_title?: string;
    project_name?: string;
  };
  vendors?: {
    vendor_name?: string;
  };
  project_success_rating: number;
  vendor_overall_rating: number;
  vendor_quality_rating: number;
  vendor_communication_rating: number;
  created_at: string;
}

type TableType = 'vendors' | 'clients' | 'projects' | 'ratings' | 'taxonomy' | 'import';
type ImportType = 'vendors' | 'projects' | 'ratings';

interface TaxonomyAnalysis {
  summary: {
    totalProjectTypes: number;
    totalVendorCategories: number;
    alignedTypes: number;
    alignmentPercentage: number;
    businessImpact: string;
  };
  projectTypes: Array<{ type: string; count: number }>;
  vendorCategories: Array<{ category: string; count: number }>;
  alignmentSuggestions: Record<string, string>;
  recommendations: {
    immediate: string;
    strategic: string;
    businessValue: string;
  };
}

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
  const [taxonomyAnalysis, setTaxonomyAnalysis] = useState<TaxonomyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Vendor | Client | Project | Rating | null>(null);

  // Import functionality state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<ImportType>('vendors');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Relationship repair state
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<{ success: boolean, message: string } | null>(null);

  // Helper function to get project type from assigned vendor category
  const getProjectTypeFromVendor = (projectId: string): string => {
    // Find the rating for this project
    const projectRating = ratings.find(rating => rating.project_id === projectId);

    if (!projectRating) {
      return 'unassigned';
    }

    // Find the vendor for this rating
    const assignedVendor = vendors.find(vendor => vendor.vendor_id === projectRating.vendor_id);

    if (!assignedVendor || !assignedVendor.service_categories || assignedVendor.service_categories.length === 0) {
      return 'unassigned';
    }

    // Return the primary service category (first one)
    return assignedVendor.service_categories[0];
  };

  // Load data for active table
  useEffect(() => {
    if (activeTable === 'taxonomy') {
      loadTaxonomyAnalysis();
    } else if (activeTable !== 'import') {
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

  const loadTaxonomyAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analyze-categories');
      const data = await response.json();
      setTaxonomyAnalysis(data);
    } catch (error) {
      console.error('Error loading taxonomy analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Vendor | Client | Project | Rating) => {
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem) return;

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
          primaryKey = (editingItem as Rating).rating_id;
          break;
        default:
          console.error('Unknown table type:', activeTable);
          return;
      }

      const response = await fetch(`/api/admin/update-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: activeTable,
          id: primaryKey,
          data: editingItem
        })
      });

      if (response.ok) {
        setEditingItem(null);
        loadTableData();
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
      }
    } catch (error) {
      console.error('Error saving record:', error);
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
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {vendors.map((vendor) => (
            <tr key={vendor.vendor_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{vendor.vendor_name}</td>
              <td className="px-4 py-2 text-sm text-gray-600">
                <div>{vendor.contact_name}</div>
                <div className="text-xs text-gray-400">{vendor.contact_email}</div>
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex flex-wrap gap-1">
                  {vendor.service_categories?.map(cat => (
                    <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-2 text-sm">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(vendor)} className="text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(vendor.vendor_id)} className="text-red-600 hover:text-red-800">
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
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.project_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {project.project_title || project.project_name}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {project.project_type ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {project.project_type}
                  </span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {getProjectTypeFromVendor(project.project_id)}
                    </span>
                    <span className="text-gray-400 text-xs">(from vendor)</span>
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {project.status}
                </span>
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
            <tr key={rating.rating_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {rating.projects?.project_title || 'N/A'}
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {rating.vendors?.vendor_name || rating.vendor_name || 'N/A'}
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
                  <button onClick={() => handleDelete(rating.rating_id)} className="text-red-600 hover:text-red-800">
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
      const response = await fetch('/api/import', {
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
    link.href = `/templates/${type}_template.csv`;
    link.download = `${type}_template.csv`;
    link.click();
  };

  // Handle relationship repair
  const handleRepairRelationships = async () => {
    if (!confirm('This will restore project-vendor-rating relationships from the original Accelo export. Continue?')) {
      return;
    }

    setIsRepairing(true);
    setRepairResult(null);

    try {
      const response = await fetch('/api/admin/repair-relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setRepairResult(data);

      if (data.success) {
        // Refresh all data to show the repaired relationships
        loadTableData();
        loadTaxonomyAnalysis();
      }
    } catch (error) {
      setRepairResult({
        success: false,
        message: 'Repair failed. Please check console for details.'
      });
      console.error('Repair error:', error);
    } finally {
      setIsRepairing(false);
    }
  };

  const renderImportSection = () => (
    <div className="space-y-6">
      {/* Step 1: Download Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Download Templates</h3>
        <p className="text-sm text-gray-600 mb-4">Download and fill out the CSV templates with your data</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => downloadTemplate('vendors')}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Vendors Template
          </button>
          <button
            onClick={() => downloadTemplate('projects')}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Projects Template
          </button>
          <button
            onClick={() => downloadTemplate('ratings')}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Ratings Template
          </button>
        </div>
      </div>

      {/* Step 2: Select Import Type */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Select Import Type</h3>
        <p className="text-sm text-gray-600 mb-4">Choose what type of data you&apos;re importing</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['vendors', 'projects', 'ratings'] as ImportType[]).map((type) => (
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
                className={`p-4 rounded-lg border-2 transition-colors ${importType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <h4 className="font-semibold capitalize">{type}</h4>
                <p className="text-sm text-gray-600">Import {type} data</p>
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

  const renderTaxonomySection = () => {
    if (!taxonomyAnalysis) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const { summary, projectTypes, vendorCategories, recommendations } = taxonomyAnalysis;

    return (
      <div className="space-y-6">
        {/* Alignment Status Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxonomy Alignment Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalProjectTypes}</div>
              <div className="text-sm text-gray-600">Project Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.totalVendorCategories}</div>
              <div className="text-sm text-gray-600">Vendor Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.alignedTypes}</div>
              <div className="text-sm text-gray-600">Aligned Types</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${summary.alignmentPercentage < 25 ? 'text-red-600' :
                summary.alignmentPercentage < 75 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                {Math.round(summary.alignmentPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Alignment</div>
            </div>
          </div>

          {/* Business Impact Alert */}
          <div className={`p-4 rounded-lg ${summary.alignmentPercentage === 0 ? 'bg-red-50 border border-red-200' :
            summary.alignmentPercentage < 50 ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
            <div className="flex items-start">
              <AlertCircle className={`h-5 w-5 mt-0.5 mr-3 ${summary.alignmentPercentage === 0 ? 'text-red-600' :
                summary.alignmentPercentage < 50 ? 'text-yellow-600' : 'text-green-600'
                }`} />
              <div>
                <p className={`font-medium ${summary.alignmentPercentage === 0 ? 'text-red-800' :
                  summary.alignmentPercentage < 50 ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                  Business Impact: {summary.businessImpact}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {recommendations.businessValue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Project Types */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Project Types</h3>
          {projectTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectTypes.map((type) => (
                <div key={type.type} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">{type.type}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {type.count} projects
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No project types currently assigned</p>
          )}
        </div>

        {/* Current Vendor Categories */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Vendor Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendorCategories.map((category) => (
              <div key={category.category} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">{category.category.replace('_', ' ')}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {category.count} vendors
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Immediate Action</h4>
              <p className="text-blue-800">{recommendations.immediate}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Strategic Implementation</h4>
              <p className="text-purple-800">{recommendations.strategic}</p>
            </div>
          </div>
        </div>

        {/* Relationship Repair Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Relationship Repair</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              If project types are showing as "unassigned (from vendor)", this indicates broken project-vendor-rating relationships.
              Use this tool to restore connections from the original Accelo export data.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Before running repair:</p>
                  <ul className="text-yellow-700 mt-1 ml-4 list-disc">
                    <li>Converts 10-point Accelo ratings to 5-point ViRA scale</li>
                    <li>Creates missing ratings records to link projects and vendors</li>
                    <li>Process is safe and can be run multiple times</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRepairRelationships}
              disabled={isRepairing}
              className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRepairing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Repairing Relationships...
                </>
              ) : (
                <>
                  <Database size={16} />
                  Repair Accelo Relationships
                </>
              )}
            </button>

            {repairResult && (
              <div className={`px-4 py-2 rounded-md text-sm ${repairResult.success
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                {repairResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium">1. Create Unified Taxonomy Mapping</p>
                <p className="text-sm text-gray-600">Map vendor categories to standardized project types</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium">2. Bulk Assign Project Types</p>
                <p className="text-sm text-gray-600">Apply project types to existing projects based on titles/descriptions</p>
              </div>
            </div>
            <div className="flex items-start">
              <Star className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium">3. Enable Automated Matching</p>
                <p className="text-sm text-gray-600">Implement automated vendor-project recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit {activeTable.slice(0, -1)}</h2>
            <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(editingItem).map(([key, value]) => {
              if (key.includes('_id') || key === 'created_at') return null;

              if (key === 'service_categories' && Array.isArray(value)) {
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={value.join(', ')}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        [key]: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="data_analytics, web_development, etc."
                    />
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={value as string}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      [key]: typeof value === 'number' ? Number(e.target.value) : e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
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
                { key: 'taxonomy', label: 'Taxonomy', icon: Database, count: taxonomyAnalysis ? Math.round(taxonomyAnalysis.summary.alignmentPercentage) : null },
                { key: 'import', label: 'Import Data', icon: Upload, count: null }
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
                {activeTable === 'taxonomy' && renderTaxonomySection()}
                {activeTable === 'import' && renderImportSection()}
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
