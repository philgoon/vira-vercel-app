'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Users, TrendingUp } from 'lucide-react';

interface ReviewStats {
  total_assignments: number;
  pending_count: number;
  in_progress_count: number;
  completed_count: number;
  overdue_count: number;
  completion_rate: number;
  average_completion_days: number;
}

interface OverdueAssignment {
  assignment_id: string;
  project_title: string;
  reviewer_name: string;
  reviewer_email: string;
  due_date: string;
  days_overdue: number;
}

export default function ReviewMonitoringDashboard() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [overdueAssignments, setOverdueAssignments] = useState<OverdueAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/review-stats');

      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setStats(null);
        return;
      }

      const data = await response.json();
      setStats(data.stats);
      setOverdueAssignments(data.overdue_assignments || []);
    } catch (error) {
      console.error('Error loading review stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading review statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Failed to load review statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Max 3 cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Assignments */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_assignments}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.completion_rate.toFixed(0)}%
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Overdue Count */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue_count}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Average Completion Time */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Completion</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.average_completion_days.toFixed(1)}d
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Assignment Status Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending_count}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.in_progress_count}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-800 font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed_count}</p>
          </div>
        </div>
      </div>

      {/* Overdue Assignments Table */}
      {overdueAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Overdue Reviews ({overdueAssignments.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reviewer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {overdueAssignments.map((assignment) => (
                  <tr key={assignment.assignment_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{assignment.project_title}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <div>{assignment.reviewer_name}</div>
                      <div className="text-xs text-gray-500">{assignment.reviewer_email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {assignment.days_overdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Overdue Message */}
      {overdueAssignments.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-green-800 font-medium">No overdue reviews! Great job!</p>
          <p className="text-sm text-green-600 mt-1">All assignments are on track.</p>
        </div>
      )}
    </div>
  );
}
