'use client';

// [R1] Vendor Sync Panel for Admin Interface - Populates Missing Vendor Records
import { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Users, Database } from 'lucide-react';

interface VendorSyncStatus {
  missingVendors: Array<{
    vendor_id: string;
    projectCount: number;
  }>;
  totalMissing: number;
  totalVendors: number;
  totalProjects: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    created: number;
    errors: string[];
  };
}

export default function VendorSyncPanel() {
  const [syncStatus, setSyncStatus] = useState<VendorSyncStatus | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load sync status to see what vendors are missing
  const loadSyncStatus = async () => {
    setLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/admin/sync-vendors');
      const data = await response.json();

      if (data.success) {
        // [R1] Transform API response to match component interface
        const transformedStatus: VendorSyncStatus = {
          missingVendors: data.missingVendors || [],
          totalMissing: data.count || 0,
          totalVendors: data.summary?.totalVendors || 0,
          totalProjects: data.summary?.totalProjects || 0
        };
        setSyncStatus(transformedStatus);
      } else {
        setSyncResult({
          success: false,
          message: `Failed to load sync status: ${data.error}`
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: `Error loading sync status: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Execute the vendor sync operation
  const executeSync = async () => {
    if (!syncStatus || syncStatus.missingVendors.length === 0) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/admin/sync-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setSyncResult(data);

      // Reload status after successful sync
      if (data.success) {
        await loadSyncStatus();
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Sync Overview</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Database className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Purpose:</p>
              <p className="text-sm text-blue-700 mt-1">
                Automatically populate the vendors table with vendor_ids from your project data.
                This enables calculated metrics like total projects, ratings, and client analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={loadSyncStatus}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Checking Status...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Check Vendor Status
              </>
            )}
          </button>

          {syncStatus && syncStatus.missingVendors.length > 0 && (
            <button
              onClick={executeSync}
              disabled={syncing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Syncing Vendors...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Sync Missing Vendors
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status Display */}
      {syncStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Status</h3>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncStatus.totalVendors}</div>
              <div className="text-sm text-gray-600">Current Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStatus.totalProjects}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${syncStatus.totalMissing === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {syncStatus.totalMissing}
              </div>
              <div className="text-sm text-gray-600">Missing Vendors</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${syncStatus.totalMissing === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                {syncStatus.totalMissing === 0 ? '✓' : '!'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-4 rounded-lg ${syncStatus.totalMissing === 0
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
            }`}>
            <div className="flex items-start">
              {syncStatus.totalMissing === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              )}
              <div>
                <p className={`font-medium ${syncStatus.totalMissing === 0 ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                  {syncStatus.totalMissing === 0
                    ? 'All vendors are synced!'
                    : `${syncStatus.totalMissing} vendor(s) need to be added to the vendors table`
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {syncStatus.totalMissing === 0
                    ? 'Your vendor analytics and calculated metrics are working properly.'
                    : 'These vendor_ids exist in projects but are missing from the vendors table, which breaks calculated metrics.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Missing Vendors List */}
          {syncStatus.missingVendors.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Missing Vendors:</h4>
              <div className="space-y-2">
                {syncStatus.missingVendors.map((vendor) => (
                  <div key={vendor.vendor_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{vendor.vendor_id}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({vendor.projectCount} project{vendor.projectCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Missing
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {syncResult && (
        <div className={`border rounded-lg p-4 ${syncResult.success
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50'
          }`}>
          <div className="flex items-start">
            {syncResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${syncResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                {syncResult.message}
              </p>
              {syncResult.details && (
                <div className="mt-2 text-sm">
                  <p>Created: {syncResult.details.created} vendor record(s)</p>
                  {syncResult.details.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Errors:</p>
                      <ul className="list-disc list-inside">
                        {syncResult.details.errors.map((error, index) => (
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

      {/* Help Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Vendor Sync Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">1</span>
            <p>Projects create vendor_ids automatically when imported from CSV</p>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">2</span>
            <p>The vendors table is a static reference table for vendor profiles and calculated metrics</p>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">3</span>
            <p>Sync creates vendor records for any vendor_ids that exist in projects but not in vendors table</p>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">4</span>
            <p>This enables calculated metrics like total projects, average ratings, and client analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
