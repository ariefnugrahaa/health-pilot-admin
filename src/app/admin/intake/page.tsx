'use client';

import { useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Eye, Trash2, Archive, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIntakeFlows, useArchiveIntakeFlow, useSetDefaultIntakeFlow, useDeleteIntakeFlow, useCreateIntakeFlow, useCreateSection } from '@/hooks/use-intake-flows';
import type { IntakeFlowStatus, CreateIntakeFlowInput } from '@/types/intake';
import { formatDistanceToNow } from 'date-fns';
import {
  createDefaultScoringConfigForAssignment,
  INTAKE_ASSIGNMENT_OPTIONS,
} from '@/lib/intake-flow-config';

export default function IntakeFlowsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flowData, setFlowData] = useState<CreateIntakeFlowInput>({
    name: '',
    description: '',
    assignedTo: INTAKE_ASSIGNMENT_OPTIONS[0],
  });

  const { data: intakeFlows, isLoading, error } = useIntakeFlows(
    statusFilter === 'ALL' ? undefined : { status: statusFilter as IntakeFlowStatus }
  );

  const createFlowMutation = useCreateIntakeFlow();
  const createSectionMutation = useCreateSection();
  const archiveMutation = useArchiveIntakeFlow();
  const setDefaultMutation = useSetDefaultIntakeFlow();
  const deleteMutation = useDeleteIntakeFlow();

  const filteredFlows = intakeFlows?.filter(flow =>
    flow.name.toLowerCase().includes(search.toLowerCase()) ||
    flow.assignedTo?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStatusBadge = (status: IntakeFlowStatus) => {
    const styles = {
      ACTIVE: 'bg-green-50 text-green-700 border-green-600',
      DRAFT: 'bg-gray-50 text-gray-700 border-gray-300',
      INACTIVE: 'bg-red-50 text-red-700 border-red-600',
      ARCHIVED: 'bg-orange-50 text-orange-700 border-orange-600',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const handleCreateFlow = async () => {
    if (!flowData.name.trim()) {
      alert('Please enter a flow name');
      return;
    }

    try {
      const payload = {
        ...flowData,
        scoringConfig:
          flowData.scoringConfig ?? createDefaultScoringConfigForAssignment(flowData.assignedTo),
      };
      console.log('Creating intake flow:', flowData);
      const newFlow = await createFlowMutation.mutateAsync(payload);
      console.log('Flow created successfully:', newFlow);
      
      await createSectionMutation.mutateAsync({
        intakeFlowId: newFlow.id,
        title: 'Basic Information',
        order: 0,
      });

      setShowCreateModal(false);
      setFlowData({ name: '', description: '', assignedTo: INTAKE_ASSIGNMENT_OPTIONS[0] });
      router.push(`/admin/intake/${newFlow.id}/edit`);
    } catch (error) {
      console.error('Error creating intake flow:', error);
      alert('Failed to create intake flow. Please try again.');
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this intake flow?')) {
      await archiveMutation.mutateAsync(id);
      setMenuOpen(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id);
    setMenuOpen(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this intake flow? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
      setMenuOpen(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load intake flows. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Intake Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and configure user health intake workflows.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} />
            <span className="text-sm font-medium">Create New Flow</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Flow Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No intake flows found. Create your first flow to get started.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => (
                  <tr key={flow.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{flow.name}</span>
                        {flow.isDefault && (
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-200">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(flow.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">v{flow.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{flow.assignedTo || 'Default'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === flow.id ? null : flow.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {menuOpen === flow.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button
                              onClick={() => {
                                router.push(`/admin/intake/${flow.id}/edit`);
                                setMenuOpen(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/admin/intake/${flow.id}/preview`);
                                setMenuOpen(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye size={14} />
                              Preview
                            </button>
                            {flow.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleArchive(flow.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Archive size={14} />
                                Archive
                              </button>
                            )}
                            {!flow.isDefault && flow.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleSetDefault(flow.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <CheckCircle size={14} />
                                Set as Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(flow.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Intake Flow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flow Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={flowData.name}
                  onChange={(e) => setFlowData({ ...flowData, name: e.target.value })}
                  placeholder="Enter flow name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  value={flowData.assignedTo || INTAKE_ASSIGNMENT_OPTIONS[0]}
                  onChange={(e) =>
                    setFlowData((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                      scoringConfig: createDefaultScoringConfigForAssignment(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  {INTAKE_ASSIGNMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={flowData.description || ''}
                  onChange={(e) => setFlowData({ ...flowData, description: e.target.value })}
                  placeholder="Describe what this intake flow is for"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFlow}
                disabled={createFlowMutation.isPending}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createFlowMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Flow'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
