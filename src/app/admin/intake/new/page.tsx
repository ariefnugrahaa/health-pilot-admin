'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateIntakeFlow, useCreateSection } from '@/hooks/use-intake-flows';
import type { CreateIntakeFlowInput } from '@/types/intake';
import {
  createDefaultScoringConfigForAssignment,
  INTAKE_ASSIGNMENT_OPTIONS,
} from '@/lib/intake-flow-config';

export default function NewIntakeFlowPage() {
  const router = useRouter();
  const [flowData, setFlowData] = useState<CreateIntakeFlowInput>({
    name: '',
    description: '',
    assignedTo: INTAKE_ASSIGNMENT_OPTIONS[0],
  });

  const createFlowMutation = useCreateIntakeFlow();
  const createSectionMutation = useCreateSection();

  const handleCreate = async () => {
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
      
      console.log('Creating section for flow:', newFlow.id);
      const newSection = await createSectionMutation.mutateAsync({
        intakeFlowId: newFlow.id,
        title: 'Basic Information',
        order: 0,
      });
      console.log('Section created successfully:', newSection);

      console.log('Redirecting to edit page...');
      router.push(`/admin/intake/${newFlow.id}/edit`);
    } catch (error: unknown) {
      console.error('Error creating intake flow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create intake flow: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/intake')}
              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Intake Configuration
            </button>
            <button
              onClick={handleCreate}
              disabled={createFlowMutation.isPending}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {createFlowMutation.isPending ? 'Creating...' : 'Create & Continue'}
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Intake Flow</h1>
            <p className="text-sm text-gray-500 mt-1">Configure the structure and logic of this health intake workflow.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
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
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Flow Structure</h2>
              <div className="text-center py-12 text-gray-500">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-sm">Create this flow to start adding sections and fields.</p>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleCreate}
                  disabled={createFlowMutation.isPending}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {createFlowMutation.isPending ? 'Creating...' : 'Create & Continue'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-900 mb-2 uppercase">Getting Started</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">1.</span>
                    <span>Enter a name and description for your intake flow.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">2.</span>
                    <span>Click Create & Continue to proceed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">3.</span>
                    <span>Add sections and fields to customize your intake form.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">4.</span>
                    <span>Preview and publish when ready.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
