'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import {
  useCreateField,
  useCreateSection,
  useDeleteField,
  useDeleteSection,
  useIntakeFlow,
  useUpdateField,
  useUpdateIntakeFlow,
  useUpdateSection,
} from '@/hooks/use-intake-flows';
import {
  createDefaultBloodEnhancedScoringConfig,
  createDefaultScoringConfig,
  createDefaultScoringConfigForAssignment,
  ensureScoringConfigForAssignment,
  INTAKE_ASSIGNMENT_OPTIONS,
  isBloodEnhancedIntake,
  supportsOutputMapping,
  supportsRules,
  supportsScoring,
} from '@/lib/intake-flow-config';
import type {
  FieldType,
  IntakeFlowActionRule,
  IntakeFlowBloodMarkerRule,
  IntakeFlowOutputMappingConfig,
  IntakeFlowField,
  IntakeFlowRecommendationPriorityItem,
  IntakeFlowRiskBucket,
  IntakeFlowRiskHeadlineMapping,
  IntakeFlowScoringConfig,
  IntakeFlowScoringDomain,
  IntakeFlowTagSignalMapping,
} from '@/types/intake';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT', label: 'Short text' },
  { value: 'TEXTAREA', label: 'Long text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'DATE', label: 'Date' },
  { value: 'SELECT', label: 'Dropdown' },
  { value: 'MULTI_SELECT', label: 'Multi-select' },
  { value: 'RADIO', label: 'Radio group' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'BOOLEAN', label: 'Yes/No' },
];

const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  TEXT: 'Short text',
  TEXTAREA: 'Long text',
  NUMBER: 'Number',
  EMAIL: 'Email',
  PHONE: 'Phone',
  DATE: 'Date',
  SELECT: 'Dropdown',
  MULTI_SELECT: 'Multi-select',
  RADIO: 'Radio group',
  CHECKBOX: 'Checkbox',
  BOOLEAN: 'Yes/No',
};

type OptionDraft = {
  value: string;
  label: string;
};

type QuestionDraft = {
  label: string;
  type: FieldType;
  placeholder: string;
  helperText: string;
  isRequired: boolean;
  options: OptionDraft[];
  dependsOnField: string;
  dependsOnValue: string;
};

type FlowInfoDraft = {
  name: string;
  assignedTo: string;
  description: string;
};

type StepDraft = {
  title: string;
  description: string;
  isOptional: boolean;
};

type ConditionalOperator = 'answered' | 'equals';
type EditorTab = 'questions' | 'scoring' | 'rules' | 'outputMapping';

const OPTION_FIELD_TYPES: FieldType[] = ['SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX'];
const BLOOD_MARKER_OPERATORS: IntakeFlowBloodMarkerRule['operator'][] = ['>', '>=', '<', '<=', '='];
const BLOOD_MARKER_ACTION_TYPES: IntakeFlowBloodMarkerRule['actionType'][] = ['ADD', 'SUBTRACT', 'SET'];
const RULE_CONDITION_TYPES: Array<{ value: 'TAG_EXISTS' | 'RISK_LEVEL' | 'DOMAIN_SCORE'; label: string }> = [
  { value: 'TAG_EXISTS', label: 'Tag exists' },
  { value: 'RISK_LEVEL', label: 'Risk level' },
  { value: 'DOMAIN_SCORE', label: 'Domain score' },
];
const RULE_ACTION_TYPES: Array<{ value: 'INCLUDE_PATHWAY' | 'EXCLUDE_PATHWAY' | 'ADD_TAG'; label: string }> = [
  { value: 'INCLUDE_PATHWAY', label: 'Include Pathway' },
  { value: 'EXCLUDE_PATHWAY', label: 'Exclude Pathway' },
  { value: 'ADD_TAG', label: 'Add Tag' },
];

function createBloodMarkerRuleDraft(): IntakeFlowBloodMarkerRule {
  return {
    id: `blood_marker_${crypto.randomUUID()}`,
    marker: '',
    operator: '>',
    value: 0,
    actionType: 'ADD',
    scoreModifier: 1,
    targetDomainId: '',
  };
}

function createRuleConditionDraft() {
  return {
    id: `condition_${crypto.randomUUID()}`,
    type: 'TAG_EXISTS' as const,
    value: '',
  };
}

function createRuleActionDraft() {
  return {
    id: `action_${crypto.randomUUID()}`,
    type: 'INCLUDE_PATHWAY' as const,
    value: '',
  };
}

function createActionRuleDraft(index: number): IntakeFlowActionRule {
  return {
    id: `rule_${crypto.randomUUID()}`,
    name: `Rule ${index + 1}`,
    conditionOperator: 'AND',
    actionOperator: 'AND',
    conditions: [createRuleConditionDraft()],
    actions: [createRuleActionDraft()],
  };
}

function createRecommendationPriorityDraft(index: number): IntakeFlowRecommendationPriorityItem {
  return {
    id: `priority_${crypto.randomUUID()}`,
    label: '',
    order: index,
  };
}

function createRiskHeadlineDraft(riskBucketId = ''): IntakeFlowRiskHeadlineMapping {
  return {
    id: `headline_${crypto.randomUUID()}`,
    riskBucketId,
    headline: '',
    summary: '',
  };
}

function createTagSignalDraft(): IntakeFlowTagSignalMapping {
  return {
    id: `tag_signal_${crypto.randomUUID()}`,
    tag: '',
    insightParagraph: '',
  };
}

function createDefaultOptions(): OptionDraft[] {
  return [
    { value: 'option_1', label: 'Option 1' },
    { value: 'option_2', label: 'Option 2' },
  ];
}

function toQuestionDraft(field: IntakeFlowField): QuestionDraft {
  return {
    label: field.label,
    type: field.type,
    placeholder: field.placeholder ?? '',
    helperText: field.helperText ?? '',
    isRequired: field.isRequired,
    options: (field.options ?? []).map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
    dependsOnField: field.dependsOnField ?? '',
    dependsOnValue: field.dependsOnValue ?? '',
  };
}

function normalizeOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function getConditionalOperator(draft: QuestionDraft): ConditionalOperator {
  return draft.dependsOnValue.trim().length > 0 ? 'equals' : 'answered';
}

function createDomainDraft(): IntakeFlowScoringDomain {
  return {
    id: `domain_${crypto.randomUUID()}`,
    name: '',
    weight: 1,
    enabled: true,
  };
}

function createRiskBucketDraft(): IntakeFlowRiskBucket {
  return {
    id: `risk_${crypto.randomUUID()}`,
    minScore: 0,
    maxScore: 10,
    label: '',
    color: '#10b981',
    description: '',
  };
}

export default function EditIntakeFlowPage() {
  const router = useRouter();
  const params = useParams();
  const flowId = String(params.id ?? '');

  const { data: flow, isLoading, error, refetch } = useIntakeFlow(flowId);

  const updateFlowMutation = useUpdateIntakeFlow();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const createFieldMutation = useCreateField();
  const updateFieldMutation = useUpdateField();
  const deleteFieldMutation = useDeleteField();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [flowDraft, setFlowDraft] = useState<FlowInfoDraft>({
    name: '',
    assignedTo: '',
    description: '',
  });
  const [stepDraft, setStepDraft] = useState<StepDraft>({
    title: '',
    description: '',
    isOptional: false,
  });
  const [questionDrafts, setQuestionDrafts] = useState<Record<string, QuestionDraft>>({});
  const [savingStep, setSavingStep] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [conditionalRuleTargetIds, setConditionalRuleTargetIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<EditorTab>('questions');
  const [scoringDraft, setScoringDraft] = useState<IntakeFlowScoringConfig | null>(null);

  const sections = useMemo(() => flow?.sections ?? [], [flow?.sections]);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  useEffect(() => {
    if (!flow) {
      return;
    }

    setFlowDraft({
      name: flow.name,
      assignedTo: flow.assignedTo ?? '',
      description: flow.description ?? '',
    });
    setScoringDraft(ensureScoringConfigForAssignment(flow.assignedTo, flow.scoringConfig));
  }, [flow]);

  useEffect(() => {
    if (supportsScoring(flowDraft.assignedTo) && !scoringDraft) {
      setScoringDraft(createDefaultScoringConfigForAssignment(flowDraft.assignedTo));
    }

    if (
      (!supportsScoring(flowDraft.assignedTo) && activeTab === 'scoring') ||
      (!supportsRules(flowDraft.assignedTo) && activeTab === 'rules') ||
      (!supportsOutputMapping(flowDraft.assignedTo) && activeTab === 'outputMapping')
    ) {
      setActiveTab('questions');
    }
  }, [activeTab, flowDraft.assignedTo, scoringDraft]);

  useEffect(() => {
    if (!sections.length) {
      setActiveSectionId(null);
      return;
    }

    const hasActiveSection = activeSectionId
      ? sections.some((section) => section.id === activeSectionId)
      : false;

    if (!hasActiveSection) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  useEffect(() => {
    if (!activeSection) {
      setStepDraft({ title: '', description: '', isOptional: false });
      setQuestionDrafts({});
      setExpandedFieldId(null);
      setConditionalRuleTargetIds([]);
      return;
    }

    setStepDraft({
      title: activeSection.title,
      description: activeSection.description ?? '',
      isOptional: activeSection.isOptional,
    });

    const nextDrafts: Record<string, QuestionDraft> = {};
    activeSection.fields.forEach((field) => {
      nextDrafts[field.id] = toQuestionDraft(field);
    });

    setQuestionDrafts(nextDrafts);
    setConditionalRuleTargetIds(
      activeSection.fields.filter((field) => field.dependsOnField).map((field) => field.id),
    );
    setExpandedFieldId((prev) => {
      if (prev && nextDrafts[prev]) {
        return prev;
      }
      return activeSection.fields[0]?.id ?? null;
    });
  }, [activeSection]);

  const dependencyFields = useMemo(() => {
    return sections.flatMap((section) =>
      section.fields.map((field) => ({
        id: field.id,
        key: field.fieldKey,
        label: field.label,
        sectionTitle: section.title,
      })),
    );
  }, [sections]);

  const isBusy =
    updateFlowMutation.isPending ||
    createSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    deleteSectionMutation.isPending ||
    createFieldMutation.isPending ||
    updateFieldMutation.isPending ||
    deleteFieldMutation.isPending ||
    savingStep ||
    !!savingQuestionId;

  const saveFlowInfo = async () => {
    if (!flow) {
      return;
    }

    const payload = {
      name: flowDraft.name.trim() || flow.name,
      assignedTo: normalizeOptional(flowDraft.assignedTo),
      description: normalizeOptional(flowDraft.description),
      scoringConfig: supportsScoring(flowDraft.assignedTo)
        ? ensureScoringConfigForAssignment(flowDraft.assignedTo, scoringDraft)
        : null,
    };

    await updateFlowMutation.mutateAsync({ id: flow.id, data: payload });
    await refetch();
  };

  const handleCreateSection = async () => {
    if (!flow) {
      return;
    }

    const nextOrder = sections.length;
    const createdSection = await createSectionMutation.mutateAsync({
      intakeFlowId: flow.id,
      title: `Step ${nextOrder + 1}`,
      description: '',
      order: nextOrder,
      isOptional: false,
    });

    await refetch();
    setActiveSectionId(createdSection.id);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this step and all questions inside it?')) {
      return;
    }

    await deleteSectionMutation.mutateAsync(sectionId);
    await refetch();
  };

  const handleSaveStep = async () => {
    if (!activeSection) {
      return;
    }

    setSavingStep(true);

    try {
      await updateSectionMutation.mutateAsync({
        id: activeSection.id,
        data: {
          title: stepDraft.title.trim() || activeSection.title,
          description: normalizeOptional(stepDraft.description),
          isOptional: stepDraft.isOptional,
        },
      });
      await refetch();
    } finally {
      setSavingStep(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!flow || !activeSection) {
      return;
    }

    const questionIndex = activeSection.fields.length + 1;
    const stepPrefix = slugify(activeSection.title) || 'step';
    const createdField = await createFieldMutation.mutateAsync({
      intakeFlowId: flow.id,
      sectionId: activeSection.id,
      fieldKey: `${stepPrefix}_q_${questionIndex}`,
      label: `Question ${questionIndex}`,
      type: 'TEXT',
      order: activeSection.fields.length,
      isRequired: true,
    });

    await refetch();
    setExpandedFieldId(createdField.id);
  };

  const handleDeleteQuestion = async (fieldId: string) => {
    if (!confirm('Delete this question?')) {
      return;
    }

    await deleteFieldMutation.mutateAsync(fieldId);
    await refetch();
  };

  const updateQuestionDraft = (
    fieldId: string,
    patch: Partial<QuestionDraft>,
  ) => {
    setQuestionDrafts((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        ...patch,
      },
    }));
  };

  const updateScoringDraft = (updater: (current: IntakeFlowScoringConfig) => IntakeFlowScoringConfig) => {
    setScoringDraft((current) =>
      updater(
        ensureScoringConfigForAssignment(flowDraft.assignedTo, current) ??
          createDefaultBloodEnhancedScoringConfig(),
      ),
    );
  };

  const updateDomainDraft = (
    domainId: string,
    patch: Partial<IntakeFlowScoringDomain>,
  ) => {
    updateScoringDraft((current) => ({
      ...current,
      domains: current.domains.map((domain) =>
        domain.id === domainId ? { ...domain, ...patch } : domain,
      ),
    }));
  };

  const removeDomainDraft = (domainId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      domains: current.domains.filter((domain) => domain.id !== domainId),
    }));
  };

  const addDomainDraft = () => {
    updateScoringDraft((current) => ({
      ...current,
      domains: [...current.domains, createDomainDraft()],
    }));
  };

  const updateRiskBucketDraft = (
    bucketId: string,
    patch: Partial<IntakeFlowRiskBucket>,
  ) => {
    updateScoringDraft((current) => ({
      ...current,
      riskBuckets: current.riskBuckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, ...patch } : bucket,
      ),
    }));
  };

  const removeRiskBucketDraft = (bucketId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      riskBuckets: current.riskBuckets.filter((bucket) => bucket.id !== bucketId),
    }));
  };

  const addRiskBucketDraft = () => {
    updateScoringDraft((current) => ({
      ...current,
      riskBuckets: [...current.riskBuckets, createRiskBucketDraft()],
    }));
  };

  const updateBloodMarkerRuleDraft = (
    ruleId: string,
    patch: Partial<IntakeFlowBloodMarkerRule>,
  ) => {
    updateScoringDraft((current) => ({
      ...current,
      bloodMarkerRules: (current.bloodMarkerRules ?? []).map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule,
      ),
    }));
  };

  const addBloodMarkerRuleDraft = () => {
    updateScoringDraft((current) => ({
      ...current,
      bloodMarkerRules: [...(current.bloodMarkerRules ?? []), createBloodMarkerRuleDraft()],
    }));
  };

  const removeBloodMarkerRuleDraft = (ruleId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      bloodMarkerRules: (current.bloodMarkerRules ?? []).filter((rule) => rule.id !== ruleId),
    }));
  };

  const updateActionRuleDraft = (ruleId: string, patch: Partial<IntakeFlowActionRule>) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
    }));
  };

  const addActionRuleDraft = () => {
    updateScoringDraft((current) => ({
      ...current,
      rules: [...(current.rules ?? []), createActionRuleDraft((current.rules ?? []).length)],
    }));
  };

  const removeActionRuleDraft = (ruleId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).filter((rule) => rule.id !== ruleId),
    }));
  };

  const updateRuleConditionDraft = (
    ruleId: string,
    conditionId: string,
    patch: Partial<IntakeFlowActionRule['conditions'][number]>,
  ) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map((condition) =>
                condition.id === conditionId ? { ...condition, ...patch } : condition,
              ),
            }
          : rule,
      ),
    }));
  };

  const addRuleConditionDraft = (ruleId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) =>
        rule.id === ruleId
          ? { ...rule, conditions: [...rule.conditions, createRuleConditionDraft()] }
          : rule,
      ),
    }));
  };

  const removeRuleConditionDraft = (ruleId: string, conditionId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.filter((condition) => condition.id !== conditionId),
            }
          : rule,
      ),
    }));
  };

  const updateRuleActionDraft = (
    ruleId: string,
    actionId: string,
    patch: Partial<IntakeFlowActionRule['actions'][number]>,
  ) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              actions: rule.actions.map((action) =>
                action.id === actionId ? { ...action, ...patch } : action,
              ),
            }
          : rule,
      ),
    }));
  };

  const addRuleActionDraft = (ruleId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) =>
        rule.id === ruleId
          ? { ...rule, actions: [...rule.actions, createRuleActionDraft()] }
          : rule,
      ),
    }));
  };

  const removeRuleActionDraft = (ruleId: string, actionId: string) => {
    updateScoringDraft((current) => ({
      ...current,
      rules: (current.rules ?? []).map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              actions: rule.actions.filter((action) => action.id !== actionId),
            }
          : rule,
      ),
    }));
  };

  const updateOutputMapping = (updater: (current: IntakeFlowOutputMappingConfig) => IntakeFlowOutputMappingConfig) => {
    updateScoringDraft((current) => ({
      ...current,
      outputMapping: updater(
        current.outputMapping ?? createDefaultBloodEnhancedScoringConfig().outputMapping ?? {
          recommendationPriority: [],
          riskHeadlineMappings: [],
          tagSignalMappings: [],
        },
      ),
    }));
  };

  const updateRecommendationPriorityDraft = (
    itemId: string,
    patch: Partial<IntakeFlowRecommendationPriorityItem>,
  ) => {
    updateOutputMapping((current) => ({
      ...current,
      recommendationPriority: current.recommendationPriority.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const addRecommendationPriorityDraft = () => {
    updateOutputMapping((current) => ({
      ...current,
      recommendationPriority: [
        ...current.recommendationPriority,
        createRecommendationPriorityDraft(current.recommendationPriority.length),
      ],
    }));
  };

  const moveRecommendationPriorityItem = (itemId: string, direction: -1 | 1) => {
    updateOutputMapping((current) => {
      const items = [...current.recommendationPriority].sort((a, b) => a.order - b.order);
      const index = items.findIndex((item) => item.id === itemId);
      const targetIndex = index + direction;

      if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
        return current;
      }

      const [item] = items.splice(index, 1);
      items.splice(targetIndex, 0, item);

      return {
        ...current,
        recommendationPriority: items.map((entry, order) => ({ ...entry, order })),
      };
    });
  };

  const updateRiskHeadlineDraft = (
    mappingId: string,
    patch: Partial<IntakeFlowRiskHeadlineMapping>,
  ) => {
    updateOutputMapping((current) => ({
      ...current,
      riskHeadlineMappings: current.riskHeadlineMappings.map((item) =>
        item.id === mappingId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const ensureRiskHeadlineMappings = () => {
    updateOutputMapping((current) => {
      const existingBucketIds = new Set(current.riskHeadlineMappings.map((item) => item.riskBucketId));
      const missing = currentScoringDraft.riskBuckets
        .filter((bucket) => !existingBucketIds.has(bucket.id))
        .map((bucket) => createRiskHeadlineDraft(bucket.id));

      return {
        ...current,
        riskHeadlineMappings: [...current.riskHeadlineMappings, ...missing],
      };
    });
  };

  const updateTagSignalDraft = (
    mappingId: string,
    patch: Partial<IntakeFlowTagSignalMapping>,
  ) => {
    updateOutputMapping((current) => ({
      ...current,
      tagSignalMappings: current.tagSignalMappings.map((item) =>
        item.id === mappingId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const addTagSignalDraft = () => {
    updateOutputMapping((current) => ({
      ...current,
      tagSignalMappings: [...current.tagSignalMappings, createTagSignalDraft()],
    }));
  };

  const removeTagSignalDraft = (mappingId: string) => {
    updateOutputMapping((current) => ({
      ...current,
      tagSignalMappings: current.tagSignalMappings.filter((item) => item.id !== mappingId),
    }));
  };

  const buildQuestionUpdateData = (draft: QuestionDraft) => {
    const needsOptions = OPTION_FIELD_TYPES.includes(draft.type);
    const normalizedOptions = draft.options
      .map((option) => ({
        value: option.value.trim(),
        label: option.label.trim(),
      }))
      .filter((option) => option.value && option.label);

    if (needsOptions && normalizedOptions.length === 0) {
      throw new Error('Please add at least one valid option for this question type.');
    }

    return {
      label: draft.label.trim() || 'Untitled question',
      type: draft.type,
      placeholder: normalizeOptional(draft.placeholder),
      helperText: normalizeOptional(draft.helperText),
      isRequired: draft.isRequired,
      options: needsOptions ? normalizedOptions : undefined,
      dependsOnField: normalizeOptional(draft.dependsOnField),
      dependsOnValue: draft.dependsOnField
        ? normalizeOptional(draft.dependsOnValue)
        : undefined,
    };
  };

  const getConditionalSourceFields = (targetFieldId: string) =>
    dependencyFields.filter((item) => item.id !== targetFieldId);

  const handleAddConditionalRule = () => {
    if (!activeSection) {
      return;
    }

    const nextTarget = activeSection.fields.find(
      (field) =>
        !conditionalRuleTargetIds.includes(field.id) &&
        getConditionalSourceFields(field.id).length > 0,
    );

    if (!nextTarget) {
      alert('Add at least two questions before creating a conditional rule.');
      return;
    }

    const defaultSource = getConditionalSourceFields(nextTarget.id)[0];
    updateQuestionDraft(nextTarget.id, {
      dependsOnField: defaultSource?.key ?? '',
      dependsOnValue: '',
    });
    setConditionalRuleTargetIds((prev) => [...prev, nextTarget.id]);
    setExpandedFieldId(nextTarget.id);
  };

  const handleConditionalRuleTargetChange = (index: number, nextTargetId: string) => {
    setConditionalRuleTargetIds((prev) =>
      prev.map((fieldId, currentIndex) => (currentIndex === index ? nextTargetId : fieldId)),
    );
  };

  const handleConditionalOperatorChange = (
    fieldId: string,
    operator: ConditionalOperator,
  ) => {
    const draft = questionDrafts[fieldId];
    if (!draft) {
      return;
    }

    updateQuestionDraft(fieldId, {
      dependsOnValue: operator === 'answered' ? '' : draft.dependsOnValue,
    });
  };

  const handleDeleteConditionalRule = async (fieldId: string) => {
    const draft = questionDrafts[fieldId];
    if (!draft) {
      return;
    }

    const clearedDraft = {
      ...draft,
      dependsOnField: '',
      dependsOnValue: '',
    };

    updateQuestionDraft(fieldId, {
      dependsOnField: '',
      dependsOnValue: '',
    });
    setSavingQuestionId(fieldId);

    try {
      await updateFieldMutation.mutateAsync({
        id: fieldId,
        data: buildQuestionUpdateData(clearedDraft),
      });
      setConditionalRuleTargetIds((prev) => prev.filter((targetId) => targetId !== fieldId));
      await refetch();
    } catch (error) {
      updateQuestionDraft(fieldId, {
        dependsOnField: draft.dependsOnField,
        dependsOnValue: draft.dependsOnValue,
      });
      throw error;
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleAddOption = (fieldId: string) => {
    const current = questionDrafts[fieldId];
    if (!current) {
      return;
    }

    const nextIndex = current.options.length + 1;
    updateQuestionDraft(fieldId, {
      options: [
        ...current.options,
        {
          value: `option_${nextIndex}`,
          label: `Option ${nextIndex}`,
        },
      ],
    });
  };

  const handleOptionChange = (
    fieldId: string,
    optionIndex: number,
    key: 'value' | 'label',
    value: string,
  ) => {
    const current = questionDrafts[fieldId];
    if (!current) {
      return;
    }

    const nextOptions = current.options.map((option, index) =>
      index === optionIndex ? { ...option, [key]: value } : option,
    );

    updateQuestionDraft(fieldId, { options: nextOptions });
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    const current = questionDrafts[fieldId];
    if (!current) {
      return;
    }

    updateQuestionDraft(fieldId, {
      options: current.options.filter((_, index) => index !== optionIndex),
    });
  };

  const handleSaveQuestion = async (fieldId: string) => {
    const draft = questionDrafts[fieldId];
    if (!draft) {
      return;
    }

    setSavingQuestionId(fieldId);

    try {
      const updateData = buildQuestionUpdateData(draft);
      await updateFieldMutation.mutateAsync({
        id: fieldId,
        data: updateData,
      });

      await refetch();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        return;
      }
      throw error;
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!flow) {
      return;
    }

    await saveFlowInfo();
    await updateFlowMutation.mutateAsync({
      id: flow.id,
      data: { status: 'DRAFT' },
    });
    await refetch();
  };

  const handlePublishFlow = async () => {
    if (!flow) {
      return;
    }

    await saveFlowInfo();
    await updateFlowMutation.mutateAsync({
      id: flow.id,
      data: { status: 'ACTIVE' },
    });
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="p-8">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Failed to load intake flow.
        </div>
      </div>
    );
  }

  const currentScoringDraft =
    ensureScoringConfigForAssignment(flowDraft.assignedTo, scoringDraft) ??
    createDefaultScoringConfig();
  const currentOutputMapping =
    currentScoringDraft.outputMapping ??
    createDefaultBloodEnhancedScoringConfig().outputMapping ?? {
      recommendationPriority: [],
      riskHeadlineMappings: [],
      tagSignalMappings: [],
    };

  return (
    <div className="-m-4 min-h-screen bg-gray-50 sm:-m-6 lg:-m-8">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-5 sm:px-8 lg:px-10">
          <button
            onClick={() => router.push('/admin/intake')}
            className="flex items-center gap-2 text-sm text-teal-600 transition-colors hover:text-teal-700"
          >
            <ArrowLeft size={16} />
            Back to Intake Configuration
          </button>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">Edit Intake Flow</h1>
              <p className="mt-2 text-xl text-gray-500">
                Configure the structure and logic of this health intake workflow.
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/intake/${flow.id}/preview`)}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-500 px-5 py-3 text-lg font-medium text-teal-600 transition-colors hover:bg-teal-50"
            >
              <Eye size={20} />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-8 lg:px-10">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Flow Name</label>
              <input
                type="text"
                value={flowDraft.name}
                onChange={(event) => setFlowDraft((prev) => ({ ...prev, name: event.target.value }))}
                onBlur={saveFlowInfo}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Assigned To</label>
              <select
                value={flowDraft.assignedTo || INTAKE_ASSIGNMENT_OPTIONS[0]}
                onChange={(event) => {
                  const nextAssignedTo = event.target.value;
                  setFlowDraft((prev) => ({
                    ...prev,
                    assignedTo: nextAssignedTo,
                  }));
                  setScoringDraft((current) =>
                    ensureScoringConfigForAssignment(nextAssignedTo, current),
                  );
                  setActiveTab('questions');
                }}
                onBlur={() => void saveFlowInfo()}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
              >
                {INTAKE_ASSIGNMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
              <div className="rounded-full border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-600">
                {flow.status}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
              <input
                type="text"
                value={flowDraft.description}
                onChange={(event) =>
                  setFlowDraft((prev) => ({ ...prev, description: event.target.value }))
                }
                onBlur={saveFlowInfo}
                placeholder="Flow description"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {supportsScoring(flowDraft.assignedTo) && (
          <div className="mt-8 border-b border-gray-200">
            <div className="flex items-center gap-10 px-4">
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`border-b-2 px-0 py-3 text-[18px] font-medium leading-none transition-colors ${
                  activeTab === 'questions'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Questions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scoring')}
                className={`border-b-2 px-0 py-3 text-[18px] font-medium leading-none transition-colors ${
                  activeTab === 'scoring'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Scoring
              </button>
              {supportsRules(flowDraft.assignedTo) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  className={`border-b-2 px-0 py-3 text-[18px] font-medium leading-none transition-colors ${
                    activeTab === 'rules'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rules
                </button>
              )}
              {supportsOutputMapping(flowDraft.assignedTo) && (
                <button
                  type="button"
                  onClick={() => {
                    ensureRiskHeadlineMappings();
                    setActiveTab('outputMapping');
                  }}
                  className={`border-b-2 px-0 py-3 text-[18px] font-medium leading-none transition-colors ${
                    activeTab === 'outputMapping'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Output Mapping
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
        <>
        <div className="mt-8 grid grid-cols-12 gap-6">
          <section className="col-span-12 rounded-xl border border-gray-200 bg-white lg:col-span-4">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-4xl font-semibold text-gray-900">Flow Structure</h2>
            </div>
            <div className="space-y-3 px-5 py-5">
              {sections.map((section, index) => {
                const isActive = section.id === activeSectionId;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${isActive
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-200'
                      }`}
                  >
                    <GripVertical size={16} className={isActive ? 'text-white/80' : 'text-gray-400'} />
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${isActive ? 'border-white text-white' : 'border-gray-400 text-gray-600'
                        }`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-base font-medium">{section.title}</span>
                    <span className="text-xs opacity-80">{section.fields.length} q</span>
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteSection(section.id);
                      }}
                      className={`rounded p-1 ${isActive ? 'hover:bg-white/20' : 'text-red-500 hover:bg-red-50'
                        }`}
                    >
                      <Trash2 size={14} />
                    </span>
                  </button>
                );
              })}

              <button
                onClick={handleCreateSection}
                disabled={createSectionMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                Add New Step
              </button>
            </div>
          </section>

          <section className="col-span-12 rounded-xl border border-gray-200 bg-white lg:col-span-8">
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-semibold text-gray-900">Step Editor</h2>
                {activeSection && (
                  <button
                    onClick={handleSaveStep}
                    disabled={savingStep}
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-600 px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={14} />
                    {savingStep ? 'Saving...' : 'Save Step'}
                  </button>
                )}
              </div>
            </div>

            {!activeSection ? (
              <div className="px-6 py-16 text-center text-gray-500">
                Select a step from Flow Structure to start editing questions.
              </div>
            ) : (
              <div className="space-y-6 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Step Title</label>
                  <input
                    type="text"
                    value={stepDraft.title}
                    onChange={(event) =>
                      setStepDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Step Description</label>
                  <textarea
                    value={stepDraft.description}
                    onChange={(event) =>
                      setStepDraft((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={stepDraft.isOptional}
                    onChange={(event) =>
                      setStepDraft((prev) => ({ ...prev, isOptional: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  Optional step (user can skip this step)
                </label>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Questions</h3>
                    <button
                      onClick={handleAddQuestion}
                      disabled={createFieldMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-lg border border-teal-600 px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus size={14} />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeSection.fields.length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                        No questions yet. Add your first question for this step.
                      </div>
                    )}

                    {activeSection.fields.map((field) => {
                      const draft = questionDrafts[field.id] ?? toQuestionDraft(field);
                      const isExpanded = expandedFieldId === field.id;
                      const showOptions = OPTION_FIELD_TYPES.includes(draft.type);

                      return (
                        <article key={field.id} className="overflow-hidden rounded-xl border border-gray-200">
                          <button
                            onClick={() =>
                              setExpandedFieldId((prev) => (prev === field.id ? null : field.id))
                            }
                            className="flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3 text-left"
                          >
                            <div>
                              <p className="text-base font-semibold text-gray-900">{draft.label || 'Untitled question'}</p>
                              <p className="mt-0.5 text-xs text-gray-500">
                                {FIELD_TYPE_LABEL[draft.type]} • {draft.isRequired ? 'Required' : 'Optional'}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp size={16} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={16} className="text-gray-500" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="space-y-4 border-t border-gray-200 px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Question Type
                                  </label>
                                  <select
                                    value={draft.type}
                                    onChange={(event) =>
                                      updateQuestionDraft(field.id, {
                                        type: event.target.value as FieldType,
                                        options: OPTION_FIELD_TYPES.includes(
                                          event.target.value as FieldType,
                                        )
                                          ? draft.options.length > 0
                                            ? draft.options
                                            : createDefaultOptions()
                                          : [],
                                      })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                                  >
                                    {FIELD_TYPES.map((typeOption) => (
                                      <option key={typeOption.value} value={typeOption.value}>
                                        {typeOption.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <label className="inline-flex items-center gap-2 pb-3 text-sm font-medium text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={draft.isRequired}
                                    onChange={(event) =>
                                      updateQuestionDraft(field.id, {
                                        isRequired: event.target.checked,
                                      })
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  />
                                  Required
                                </label>
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                  Question Label
                                </label>
                                <input
                                  type="text"
                                  value={draft.label}
                                  onChange={(event) =>
                                    updateQuestionDraft(field.id, { label: event.target.value })
                                  }
                                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                  Placeholder
                                </label>
                                <input
                                  type="text"
                                  value={draft.placeholder}
                                  onChange={(event) =>
                                    updateQuestionDraft(field.id, {
                                      placeholder: event.target.value,
                                    })
                                  }
                                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                  Helper Text
                                </label>
                                <textarea
                                  rows={2}
                                  value={draft.helperText}
                                  onChange={(event) =>
                                    updateQuestionDraft(field.id, {
                                      helperText: event.target.value,
                                    })
                                  }
                                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
                                />
                              </div>

                              {showOptions && (
                                <div>
                                  <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Options
                                    </label>
                                    <button
                                      onClick={() => handleAddOption(field.id)}
                                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                                    >
                                      <Plus size={14} />
                                      Add option
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    {draft.options.length === 0 && (
                                      <p className="text-xs text-gray-500">
                                        Add at least one option for this question type.
                                      </p>
                                    )}

                                    {draft.options.map((option, index) => (
                                      <div key={`${field.id}-option-${index}`} className="flex gap-2">
                                        <input
                                          type="text"
                                          value={option.value}
                                          onChange={(event) =>
                                            handleOptionChange(
                                              field.id,
                                              index,
                                              'value',
                                              event.target.value,
                                            )
                                          }
                                          placeholder="Value"
                                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                                        />
                                        <input
                                          type="text"
                                          value={option.label}
                                          onChange={(event) =>
                                            handleOptionChange(
                                              field.id,
                                              index,
                                              'label',
                                              event.target.value,
                                            )
                                          }
                                          placeholder="Label"
                                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                                        />
                                        <button
                                          onClick={() => handleRemoveOption(field.id, index)}
                                          className="rounded p-2 text-red-500 hover:bg-red-50"
                                          title="Remove option"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                Conditional logic for this question is configured in the section below.
                              </div>

                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => handleDeleteQuestion(field.id)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                  Delete question
                                </button>

                                <button
                                  onClick={() => handleSaveQuestion(field.id)}
                                  disabled={savingQuestionId === field.id}
                                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Save size={14} />
                                  {savingQuestionId === field.id ? 'Saving...' : 'Save question'}
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {activeSection && (
          <section className="mt-8 rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-4xl font-semibold text-gray-900">Conditional Logic</h2>
            </div>

            <div className="space-y-4 px-6 py-6">
              {conditionalRuleTargetIds.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No conditional question rules yet. Add one to control which questions appear.
                </div>
              )}

              {conditionalRuleTargetIds.map((targetFieldId, index) => {
                const targetField = activeSection.fields.find((field) => field.id === targetFieldId);
                const targetDraft = targetField ? questionDrafts[targetField.id] : undefined;

                if (!targetField || !targetDraft) {
                  return null;
                }

                const sourceFields = getConditionalSourceFields(targetField.id);
                const operator = getConditionalOperator(targetDraft);
                const availableTargetFields = activeSection.fields.filter(
                  (field) =>
                    field.id === targetField.id || !conditionalRuleTargetIds.includes(field.id),
                );

                return (
                  <div
                    key={`${targetFieldId}-${index}`}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-5"
                  >
                    <div className="grid gap-4 lg:grid-cols-[48px_1fr_260px_48px] lg:items-start">
                      <div className="pt-3 text-base font-semibold text-gray-700">IF</div>
                      <div className="grid gap-3 md:grid-cols-[1.3fr_180px_1fr]">
                        <select
                          value={targetDraft.dependsOnField}
                          onChange={(event) =>
                            updateQuestionDraft(targetField.id, {
                              dependsOnField: event.target.value,
                              dependsOnValue: event.target.value ? targetDraft.dependsOnValue : '',
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        >
                          <option value="">Select question</option>
                          {sourceFields.map((field) => (
                            <option key={field.id} value={field.key}>
                              {field.label} ({field.sectionTitle})
                            </option>
                          ))}
                        </select>

                        <select
                          value={operator}
                          onChange={(event) =>
                            handleConditionalOperatorChange(
                              targetField.id,
                              event.target.value as ConditionalOperator,
                            )
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        >
                          <option value="equals">equals</option>
                          <option value="answered">has any answer</option>
                        </select>

                        {operator === 'equals' ? (
                          <input
                            type="text"
                            value={targetDraft.dependsOnValue}
                            onChange={(event) =>
                              updateQuestionDraft(targetField.id, {
                                dependsOnValue: event.target.value,
                              })
                            }
                            placeholder="Enter value"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                          />
                        ) : (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-500">
                            Any non-empty answer
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3">
                        <div className="pt-3 text-base font-semibold text-gray-700">THEN</div>
                        <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                          <select
                            value="show"
                            disabled
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-500 outline-none"
                          >
                            <option value="show">Show</option>
                          </select>

                          <select
                            value={targetField.id}
                            onChange={(event) =>
                              handleConditionalRuleTargetChange(index, event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                          >
                            {availableTargetFields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.label || 'Untitled question'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => void handleDeleteConditionalRule(targetField.id)}
                        className="mt-1 rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                        title="Delete rule"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-500">
                        Rule for <span className="font-medium text-gray-700">{targetDraft.label || 'Untitled question'}</span>
                      </p>
                      <button
                        onClick={() => void handleSaveQuestion(targetField.id)}
                        disabled={savingQuestionId === targetField.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={14} />
                        {savingQuestionId === targetField.id ? 'Saving...' : 'Save rule'}
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleAddConditionalRule}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-500 px-5 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50"
              >
                <Plus size={16} />
                Add Rule
	              </button>
	            </div>
	          </section>
	        )}
	        </>
	        )}

        {activeTab === 'scoring' && supportsScoring(flowDraft.assignedTo) && (
          <div className="mt-8 space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-5">
                <h2 className="text-4xl font-semibold text-gray-900">Domain Configuration</h2>
                <p className="mt-2 text-lg text-gray-500">
                  Configure scoring domains for different health areas.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                {currentScoringDraft.domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 md:grid-cols-[56px_1fr_280px_48px] md:items-end"
                  >
                    <label className="flex h-12 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={domain.enabled}
                        onChange={(event) =>
                          updateDomainDraft(domain.id, { enabled: event.target.checked })
                        }
                        className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </label>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Domain</label>
                      <input
                        type="text"
                        value={domain.name}
                        onChange={(event) =>
                          updateDomainDraft(domain.id, { name: event.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Weight</label>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={domain.weight}
                        onChange={(event) =>
                          updateDomainDraft(domain.id, {
                            weight: Number(event.target.value || 0),
                          })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                      />
                    </div>

                    <button
                      onClick={() => removeDomainDraft(domain.id)}
                      className="rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                      title="Delete domain"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addDomainDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50"
                >
                  <Plus size={16} />
                  Add Domain
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-5">
                <h2 className="text-4xl font-semibold text-gray-900">Risk Buckets</h2>
                <p className="mt-2 text-lg text-gray-500">
                  Define score ranges and corresponding risk levels.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                {currentScoringDraft.riskBuckets.map((bucket) => (
                  <div
                    key={bucket.id}
                    className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 md:grid-cols-[260px_1fr_220px_1.4fr_48px] md:items-end"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Score Range</label>
                      <div className="grid grid-cols-[1fr_20px_1fr] items-center gap-2">
                        <input
                          type="number"
                          value={bucket.minScore}
                          onChange={(event) =>
                            updateRiskBucketDraft(bucket.id, {
                              minScore: Number(event.target.value || 0),
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                        <span className="text-center text-gray-500">-</span>
                        <input
                          type="number"
                          value={bucket.maxScore}
                          onChange={(event) =>
                            updateRiskBucketDraft(bucket.id, {
                              maxScore: Number(event.target.value || 0),
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Label</label>
                      <input
                        type="text"
                        value={bucket.label}
                        onChange={(event) =>
                          updateRiskBucketDraft(bucket.id, { label: event.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Colour</label>
                      <div className="grid grid-cols-[60px_1fr] gap-3">
                        <input
                          type="color"
                          value={bucket.color}
                          onChange={(event) =>
                            updateRiskBucketDraft(bucket.id, { color: event.target.value })
                          }
                          className="h-12 w-full rounded-lg border border-gray-300 bg-white p-1"
                        />
                        <input
                          type="text"
                          value={bucket.color}
                          onChange={(event) =>
                            updateRiskBucketDraft(bucket.id, { color: event.target.value })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                      <input
                        type="text"
                        value={bucket.description ?? ''}
                        onChange={(event) =>
                          updateRiskBucketDraft(bucket.id, { description: event.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                      />
                    </div>

                    <button
                      onClick={() => removeRiskBucketDraft(bucket.id)}
                      className="rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                      title="Delete risk level"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addRiskBucketDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50"
                >
                  <Plus size={16} />
                  Add Risk Level
                </button>
              </div>
            </section>

            {isBloodEnhancedIntake(flowDraft.assignedTo) && (
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                  <h2 className="text-4xl font-semibold text-gray-900">Blood Marker Rules</h2>
                  <p className="mt-2 text-lg text-gray-500">
                    Define rules for blood markers affecting scores.
                  </p>
                </div>

                <div className="space-y-4 px-6 py-6">
                  {(currentScoringDraft.bloodMarkerRules ?? []).map((rule) => (
                    <div
                      key={rule.id}
                      className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 md:grid-cols-[1.1fr_1fr_1fr_1fr] lg:grid-cols-[1fr_0.9fr_0.9fr_1fr] xl:grid-cols-[1fr_0.9fr_0.9fr_1fr_44px]"
                    >
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Blood Marker</label>
                        <input
                          type="text"
                          value={rule.marker}
                          onChange={(event) =>
                            updateBloodMarkerRuleDraft(rule.id, { marker: event.target.value })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Operator</label>
                        <select
                          value={rule.operator}
                          onChange={(event) =>
                            updateBloodMarkerRuleDraft(rule.id, {
                              operator: event.target.value as IntakeFlowBloodMarkerRule['operator'],
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        >
                          {BLOOD_MARKER_OPERATORS.map((operator) => (
                            <option key={operator} value={operator}>
                              {operator}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Value</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rule.value}
                          onChange={(event) =>
                            updateBloodMarkerRuleDraft(rule.id, {
                              value: Number(event.target.value || 0),
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Action Type</label>
                        <select
                          value={rule.actionType}
                          onChange={(event) =>
                            updateBloodMarkerRuleDraft(rule.id, {
                              actionType: event.target.value as IntakeFlowBloodMarkerRule['actionType'],
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        >
                          {BLOOD_MARKER_ACTION_TYPES.map((actionType) => (
                            <option key={actionType} value={actionType}>
                              {actionType.charAt(0) + actionType.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Score Modifier</label>
                        <input
                          type="number"
                          value={rule.scoreModifier}
                          onChange={(event) =>
                            updateBloodMarkerRuleDraft(rule.id, {
                              scoreModifier: Number(event.target.value || 0),
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Target Domain</label>
                        <select
                          value={rule.targetDomainId}
                          onChange={(event) =>
                            updateBloodMarkerRuleDraft(rule.id, {
                              targetDomainId: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        >
                          <option value="">Select domain</option>
                          {currentScoringDraft.domains.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                              {domain.name || domain.id}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => removeBloodMarkerRuleDraft(rule.id)}
                        className="self-end rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                        title="Delete blood marker rule"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addBloodMarkerRuleDraft}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50"
                  >
                    <Plus size={16} />
                    Add Blood Marker Rule
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'rules' && supportsRules(flowDraft.assignedTo) && (
          <div className="mt-8 space-y-8">
            {(currentScoringDraft.rules ?? []).map((rule) => (
              <section key={rule.id} className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(event) =>
                      updateActionRuleDraft(rule.id, { name: event.target.value })
                    }
                    className="w-full max-w-sm border-none bg-transparent p-0 text-4xl font-semibold text-gray-900 outline-none"
                  />
                  <button
                    onClick={() => removeActionRuleDraft(rule.id)}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
                    title="Delete rule"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>

                <div className="space-y-8 px-6 py-6">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-2xl font-semibold text-gray-900">IF (Conditions)</h3>
                      <select
                        value={rule.conditionOperator}
                        onChange={(event) =>
                          updateActionRuleDraft(rule.id, {
                            conditionOperator: event.target.value as IntakeFlowActionRule['conditionOperator'],
                          })
                        }
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:border-teal-500"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {rule.conditions.map((condition) => (
                        <div
                          key={condition.id}
                          className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 md:grid-cols-[1fr_1fr_44px]"
                        >
                          <select
                            value={condition.type}
                            onChange={(event) =>
                              updateRuleConditionDraft(rule.id, condition.id, {
                                type: event.target.value as IntakeFlowActionRule['conditions'][number]['type'],
                              })
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                          >
                            {RULE_CONDITION_TYPES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(event) =>
                              updateRuleConditionDraft(rule.id, condition.id, {
                                value: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                          />
                          <button
                            onClick={() => removeRuleConditionDraft(rule.id, condition.id)}
                            className="rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                            title="Delete condition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addRuleConditionDraft(rule.id)}
                      className="mt-5 inline-flex items-center gap-2 text-xl font-medium text-teal-600 transition-colors hover:text-teal-700"
                    >
                      <Plus size={18} />
                      Add Condition
                    </button>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-2xl font-semibold text-gray-900">THEN (Actions)</h3>
                      <select
                        value={rule.actionOperator}
                        onChange={(event) =>
                          updateActionRuleDraft(rule.id, {
                            actionOperator: event.target.value as IntakeFlowActionRule['actionOperator'],
                          })
                        }
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg outline-none focus:border-teal-500"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {rule.actions.map((action) => (
                        <div
                          key={action.id}
                          className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 md:grid-cols-[1fr_1fr_44px]"
                        >
                          <select
                            value={action.type}
                            onChange={(event) =>
                              updateRuleActionDraft(rule.id, action.id, {
                                type: event.target.value as IntakeFlowActionRule['actions'][number]['type'],
                              })
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                          >
                            {RULE_ACTION_TYPES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={action.value}
                            onChange={(event) =>
                              updateRuleActionDraft(rule.id, action.id, {
                                value: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                          />
                          <button
                            onClick={() => removeRuleActionDraft(rule.id, action.id)}
                            className="rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                            title="Delete action"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addRuleActionDraft(rule.id)}
                      className="mt-5 inline-flex items-center gap-2 text-xl font-medium text-teal-600 transition-colors hover:text-teal-700"
                    >
                      <Plus size={18} />
                      Add Action
                    </button>
                  </div>
                </div>
              </section>
            ))}

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <button
                onClick={addActionRuleDraft}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-4 text-xl font-medium text-teal-600 transition-colors hover:bg-teal-50"
              >
                <Plus size={18} />
                Add New Rule
              </button>
            </section>
          </div>
        )}

        {activeTab === 'outputMapping' && supportsOutputMapping(flowDraft.assignedTo) && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                  <h2 className="text-4xl font-semibold text-gray-900">Recommendation Priority</h2>
                </div>

                <div className="space-y-3 px-6 py-6">
                  {[...currentOutputMapping.recommendationPriority]
                    .sort((a, b) => a.order - b.order)
                    .map((item, index, items) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[20px_28px_1fr_28px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                      >
                        <GripVertical size={16} className="text-gray-400" />
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-teal-300 text-sm font-semibold text-teal-600">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(event) =>
                            updateRecommendationPriorityDraft(item.id, { label: event.target.value })
                          }
                          className="border-none bg-transparent p-0 text-lg text-gray-900 outline-none"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => moveRecommendationPriorityItem(item.id, -1)}
                            disabled={index === 0}
                            className="text-gray-400 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveRecommendationPriorityItem(item.id, 1)}
                            disabled={index === items.length - 1}
                            className="text-gray-400 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                  <button
                    onClick={addRecommendationPriorityDraft}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50"
                  >
                    <Plus size={16} />
                    Add Recommendation
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                  <h2 className="text-4xl font-semibold text-gray-900">Risk Headline Mapping</h2>
                  <p className="mt-2 text-lg text-gray-500">
                    Define custom headlines and summaries for each risk level.
                  </p>
                </div>

                <div className="space-y-5 px-6 py-6">
                  {currentOutputMapping.riskHeadlineMappings.map((mapping) => {
                    const riskBucket = currentScoringDraft.riskBuckets.find(
                      (bucket) => bucket.id === mapping.riskBucketId,
                    );

                    return (
                      <div
                        key={mapping.id}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-5"
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: riskBucket?.color ?? '#10b981' }}
                          />
                          <span className="text-xl font-semibold text-gray-900">
                            {riskBucket?.label || 'Risk Level'}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Headline Text
                            </label>
                            <input
                              type="text"
                              value={mapping.headline}
                              onChange={(event) =>
                                updateRiskHeadlineDraft(mapping.id, { headline: event.target.value })
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                              Summary Description
                            </label>
                            <textarea
                              value={mapping.summary}
                              onChange={(event) =>
                                updateRiskHeadlineDraft(mapping.id, { summary: event.target.value })
                              }
                              rows={3}
                              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-5">
                <h2 className="text-4xl font-semibold text-gray-900">Tag to Signal Mapping</h2>
                <p className="mt-2 text-lg text-gray-500">
                  Map specific tags to personalized insight paragraphs.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                {currentOutputMapping.tagSignalMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 xl:grid-cols-[1fr_44px]"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Signal Title
                        </label>
                        <input
                          type="text"
                          value={mapping.tag}
                          onChange={(event) =>
                            updateTagSignalDraft(mapping.id, { tag: event.target.value })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Insight Paragraph
                        </label>
                        <textarea
                          value={mapping.insightParagraph}
                          onChange={(event) =>
                            updateTagSignalDraft(mapping.id, {
                              insightParagraph: event.target.value,
                            })
                          }
                          rows={4}
                          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeTagSignalDraft(mapping.id)}
                      className="self-start rounded-lg p-3 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
                      title="Delete tag insight"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addTagSignalDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 px-4 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-teal-50"
                >
                  <Plus size={16} />
                  Add Tag Insight
                </button>
              </div>
            </section>
          </div>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
          <button
            onClick={() => router.push('/admin/intake')}
            className="text-lg font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isBusy}
              className="rounded-xl border border-gray-400 px-6 py-3 text-lg font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save draft
            </button>
            <button
              onClick={handlePublishFlow}
              disabled={isBusy}
              className="rounded-xl bg-teal-700 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Publish flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
