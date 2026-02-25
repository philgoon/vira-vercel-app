'use client';

// [R1] Vendor Sync Panel for Admin Interface - Populates Missing Vendor Records
import { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Users, Database } from 'lucide-react';

interface VendorSyncStatus {
  missingVendors: Array<{ vendor_id: string; projectCount: number }>;
  totalMissing: number;
  totalVendors: number;
  totalProjects: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  details?: { created: number; errors: string[] };
}

const card = {
  backgroundColor: 'var(--stm-card)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-lg)',
  padding: 'var(--stm-space-6)',
};

export default function VendorSyncPanel() {
  const [syncStatus, setSyncStatus] = useState<VendorSyncStatus | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadSyncStatus = async () => {
    setLoading(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/sync-vendors');
      const data = await response.json();
      if (data.success) {
        setSyncStatus({
          missingVendors: data.missingVendors || [],
          totalMissing: data.count || 0,
          totalVendors: data.summary?.totalVendors || 0,
          totalProjects: data.summary?.totalProjects || 0,
        });
      } else {
        setSyncResult({ success: false, message: `Failed to load sync status: ${data.error}` });
      }
    } catch (error) {
      setSyncResult({ success: false, message: `Error loading sync status: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  const executeSync = async () => {
    if (!syncStatus || syncStatus.missingVendors.length === 0) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/sync-vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await response.json();
      setSyncResult(data);
      if (data.success) await loadSyncStatus();
    } catch (error) {
      setSyncResult({ success: false, message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setSyncing(false);
    }
  };

  const Spinner = () => (
    <RefreshCw style={{ width: '14px', height: '14px', flexShrink: 0 }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-6)' }}>
      {/* Overview */}
      <div style={card}>
        <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)' }}>
          Vendor Sync Overview
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--stm-space-3)',
          padding: 'var(--stm-space-4)',
          backgroundColor: 'color-mix(in srgb, var(--stm-primary) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
          marginBottom: 'var(--stm-space-4)',
        }}>
          <Database style={{ width: '16px', height: '16px', color: 'var(--stm-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)', marginBottom: 'var(--stm-space-1)' }}>Purpose</p>
            <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
              Automatically populate the vendors table with vendor_ids from your project data. This enables calculated metrics like total projects, ratings, and client analytics.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--stm-space-3)' }}>
          <button
            onClick={loadSyncStatus}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--stm-space-2)',
              padding: 'var(--stm-space-3) var(--stm-space-4)',
              border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)',
              backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)',
              fontSize: 'var(--stm-text-sm)', cursor: 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? <Spinner /> : <RefreshCw style={{ width: '14px', height: '14px' }} />}
            {loading ? 'Checking...' : 'Check Vendor Status'}
          </button>
          {syncStatus && syncStatus.missingVendors.length > 0 && (
            <button
              onClick={executeSync}
              disabled={syncing}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--stm-space-2)',
                padding: 'var(--stm-space-3) var(--stm-space-4)',
                border: 'none', borderRadius: 'var(--stm-radius-md)',
                backgroundColor: 'var(--stm-success)', color: 'white',
                fontSize: 'var(--stm-text-sm)', cursor: 'pointer', opacity: syncing ? 0.5 : 1,
              }}
            >
              {syncing ? <Spinner /> : <Users style={{ width: '14px', height: '14px' }} />}
              {syncing ? 'Syncing...' : 'Sync Missing Vendors'}
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      {syncStatus && (
        <div style={card}>
          <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)' }}>
            Sync Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--stm-space-4)', marginBottom: 'var(--stm-space-5)' }}>
            {[
              { label: 'Current Vendors', value: syncStatus.totalVendors, color: 'var(--stm-primary)' },
              { label: 'Total Projects', value: syncStatus.totalProjects, color: 'var(--stm-success)' },
              { label: 'Missing Vendors', value: syncStatus.totalMissing, color: syncStatus.totalMissing === 0 ? 'var(--stm-success)' : 'var(--stm-error)' },
              { label: 'Status', value: syncStatus.totalMissing === 0 ? '✓' : '!', color: syncStatus.totalMissing === 0 ? 'var(--stm-success)' : 'var(--stm-warning)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color }}>{value}</div>
                <div style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-1)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Status Message */}
          {(() => {
            const ok = syncStatus.totalMissing === 0;
            const color = ok ? 'var(--stm-success)' : 'var(--stm-warning)';
            return (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-3)',
                padding: 'var(--stm-space-4)',
                backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                borderRadius: 'var(--stm-radius-md)',
              }}>
                {ok
                  ? <CheckCircle style={{ width: '16px', height: '16px', color, flexShrink: 0, marginTop: '2px' }} />
                  : <AlertCircle style={{ width: '16px', height: '16px', color, flexShrink: 0, marginTop: '2px' }} />
                }
                <div>
                  <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color }}>
                    {ok ? 'All vendors are synced!' : `${syncStatus.totalMissing} vendor(s) need to be added to the vendors table`}
                  </p>
                  <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-1)' }}>
                    {ok
                      ? 'Your vendor analytics and calculated metrics are working properly.'
                      : 'These vendor_ids exist in projects but are missing from the vendors table, which breaks calculated metrics.'
                    }
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Missing Vendors List */}
          {syncStatus.missingVendors.length > 0 && (
            <div style={{ marginTop: 'var(--stm-space-5)' }}>
              <h4 style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-3)' }}>
                Missing Vendors
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-2)' }}>
                {syncStatus.missingVendors.map((vendor) => (
                  <div key={vendor.vendor_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'var(--stm-space-3)', backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius-md)',
                  }}>
                    <div>
                      <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>{vendor.vendor_id}</span>
                      <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginLeft: 'var(--stm-space-2)' }}>
                        ({vendor.projectCount} project{vendor.projectCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <span style={{
                      fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-medium)',
                      color: 'var(--stm-warning)',
                      backgroundColor: 'color-mix(in srgb, var(--stm-warning) 12%, transparent)',
                      padding: 'var(--stm-space-1) var(--stm-space-2)', borderRadius: 'var(--stm-radius-full)',
                    }}>
                      Missing
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {syncResult && (() => {
        const color = syncResult.success ? 'var(--stm-success)' : 'var(--stm-error)';
        return (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-3)',
            padding: 'var(--stm-space-4)',
            backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            borderRadius: 'var(--stm-radius-md)',
          }}>
            {syncResult.success
              ? <CheckCircle style={{ width: '16px', height: '16px', color, flexShrink: 0, marginTop: '2px' }} />
              : <AlertCircle style={{ width: '16px', height: '16px', color, flexShrink: 0, marginTop: '2px' }} />
            }
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color }}>{syncResult.message}</p>
              {syncResult.details && (
                <div style={{ marginTop: 'var(--stm-space-2)', fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>
                  <p>Created: {syncResult.details.created} vendor record(s)</p>
                  {syncResult.details.errors.length > 0 && (
                    <div style={{ marginTop: 'var(--stm-space-2)' }}>
                      <p style={{ fontWeight: 'var(--stm-font-semibold)' }}>Errors:</p>
                      <ul style={{ paddingLeft: 'var(--stm-space-4)', marginTop: 'var(--stm-space-1)' }}>
                        {syncResult.details.errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* How It Works */}
      <div style={card}>
        <h3 style={{ fontSize: 'var(--stm-text-base)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-4)' }}>
          How Vendor Sync Works
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-3)' }}>
          {[
            'Projects create vendor_ids automatically when imported from CSV',
            'The vendors table is a static reference table for vendor profiles and calculated metrics',
            'Sync creates vendor records for any vendor_ids that exist in projects but not in vendors table',
            'This enables calculated metrics like total projects, average ratings, and client analytics',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-3)' }}>
              <span style={{
                fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-medium)',
                color: 'var(--stm-primary)',
                backgroundColor: 'color-mix(in srgb, var(--stm-primary) 12%, transparent)',
                padding: 'var(--stm-space-1) var(--stm-space-2)', borderRadius: 'var(--stm-radius-sm)',
                flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <p style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
