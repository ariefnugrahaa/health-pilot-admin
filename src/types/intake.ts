export type FieldType = 'TEXT' | 'NUMBER' | 'EMAIL' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'RADIO' | 'CHECKBOX' | 'TEXTAREA' | 'PHONE' | 'BOOLEAN';
export type IntakeFlowStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface IntakeFlowScoringDomain {
  id: string;
  name: string;
  weight: number;
  enabled: boolean;
}

export interface IntakeFlowRiskBucket {
  id: string;
  minScore: number;
  maxScore: number;
  label: string;
  color: string;
  description?: string;
}

export type IntakeFlowBloodMarkerOperator = '>' | '>=' | '<' | '<=' | '=';
export type IntakeFlowBloodMarkerActionType = 'ADD' | 'SUBTRACT' | 'SET';
export type IntakeFlowRuleJoinOperator = 'AND' | 'OR';
export type IntakeFlowRuleConditionType = 'TAG_EXISTS' | 'RISK_LEVEL' | 'DOMAIN_SCORE';
export type IntakeFlowRuleActionType = 'INCLUDE_PATHWAY' | 'EXCLUDE_PATHWAY' | 'ADD_TAG';

export interface IntakeFlowBloodMarkerRule {
  id: string;
  marker: string;
  operator: IntakeFlowBloodMarkerOperator;
  value: number;
  actionType: IntakeFlowBloodMarkerActionType;
  scoreModifier: number;
  targetDomainId: string;
}

export interface IntakeFlowRuleCondition {
  id: string;
  type: IntakeFlowRuleConditionType;
  value: string;
}

export interface IntakeFlowRuleAction {
  id: string;
  type: IntakeFlowRuleActionType;
  value: string;
}

export interface IntakeFlowActionRule {
  id: string;
  name: string;
  conditionOperator: IntakeFlowRuleJoinOperator;
  actionOperator: IntakeFlowRuleJoinOperator;
  conditions: IntakeFlowRuleCondition[];
  actions: IntakeFlowRuleAction[];
}

export interface IntakeFlowRecommendationPriorityItem {
  id: string;
  label: string;
  order: number;
}

export interface IntakeFlowRiskHeadlineMapping {
  id: string;
  riskBucketId: string;
  headline: string;
  summary: string;
}

export interface IntakeFlowTagSignalMapping {
  id: string;
  tag: string;
  insightParagraph: string;
}

export interface IntakeFlowOutputMappingConfig {
  recommendationPriority: IntakeFlowRecommendationPriorityItem[];
  riskHeadlineMappings: IntakeFlowRiskHeadlineMapping[];
  tagSignalMappings: IntakeFlowTagSignalMapping[];
}

export interface IntakeFlowScoringConfig {
  domains: IntakeFlowScoringDomain[];
  riskBuckets: IntakeFlowRiskBucket[];
  bloodMarkerRules?: IntakeFlowBloodMarkerRule[];
  rules?: IntakeFlowActionRule[];
  outputMapping?: IntakeFlowOutputMappingConfig | null;
}

export interface IntakeFlowField {
  id: string;
  fieldKey: string;
  label: string;
  type: FieldType;
  placeholder: string | null;
  helperText: string | null;
  isRequired: boolean;
  order: number;
  validationRules: Record<string, unknown> | null;
  options: Array<{ value: string; label: string; description?: string }> | null;
  dependsOnField: string | null;
  dependsOnValue: string | null;
}

export interface IntakeFlowSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isOptional: boolean;
  fields: IntakeFlowField[];
}

export interface IntakeFlow {
  id: string;
  name: string;
  description: string | null;
  status: IntakeFlowStatus;
  version: number;
  isDefault: boolean;
  assignedTo: string | null;
  scoringConfig: IntakeFlowScoringConfig | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: IntakeFlowSection[];
}

export interface CreateIntakeFlowInput {
  name: string;
  description?: string;
  assignedTo?: string;
  scoringConfig?: IntakeFlowScoringConfig | null;
}

export interface UpdateIntakeFlowInput {
  name?: string;
  description?: string;
  status?: IntakeFlowStatus;
  assignedTo?: string;
  isDefault?: boolean;
  scoringConfig?: IntakeFlowScoringConfig | null;
}

export interface CreateSectionInput {
  intakeFlowId: string;
  title: string;
  description?: string;
  order: number;
  isOptional?: boolean;
}

export interface UpdateSectionInput {
  title?: string;
  description?: string;
  order?: number;
  isOptional?: boolean;
}

export interface CreateFieldInput {
  sectionId: string;
  fieldKey: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  isRequired?: boolean;
  order: number;
  validationRules?: Record<string, unknown>;
  options?: Array<{ value: string; label: string; description?: string }>;
  dependsOnField?: string;
  dependsOnValue?: string;
}

export interface UpdateFieldInput {
  label?: string;
  type?: FieldType;
  placeholder?: string;
  helperText?: string;
  isRequired?: boolean;
  order?: number;
  validationRules?: Record<string, unknown>;
  options?: Array<{ value: string; label: string; description?: string }>;
  dependsOnField?: string;
  dependsOnValue?: string;
}
