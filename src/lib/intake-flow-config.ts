import type {
  IntakeFlowActionRule,
  IntakeFlowBloodMarkerRule,
  IntakeFlowOutputMappingConfig,
  IntakeFlowRecommendationPriorityItem,
  IntakeFlowRiskBucket,
  IntakeFlowRiskHeadlineMapping,
  IntakeFlowScoringConfig,
  IntakeFlowScoringDomain,
  IntakeFlowTagSignalMapping,
} from '@/types/intake';

export const BASIC_INTAKE = 'Basic Intake';
export const COMPREHENSIVE_MEDICAL_INTAKE = 'Comprehensive Medical Intake';
export const BLOOD_ENHANCED_INTAKE = 'Blood-Enhanced Intake';

export const INTAKE_ASSIGNMENT_OPTIONS = [
  BASIC_INTAKE,
  COMPREHENSIVE_MEDICAL_INTAKE,
  BLOOD_ENHANCED_INTAKE,
] as const;

export type IntakeAssignmentOption = (typeof INTAKE_ASSIGNMENT_OPTIONS)[number];

export function isComprehensiveMedicalIntake(assignedTo?: string | null): boolean {
  return assignedTo === COMPREHENSIVE_MEDICAL_INTAKE;
}

export function isBloodEnhancedIntake(assignedTo?: string | null): boolean {
  return assignedTo === BLOOD_ENHANCED_INTAKE;
}

export function supportsScoring(assignedTo?: string | null): boolean {
  return isComprehensiveMedicalIntake(assignedTo) || isBloodEnhancedIntake(assignedTo);
}

export function supportsRules(assignedTo?: string | null): boolean {
  return isBloodEnhancedIntake(assignedTo);
}

export function supportsOutputMapping(assignedTo?: string | null): boolean {
  return isBloodEnhancedIntake(assignedTo);
}

function createDefaultDomains(): IntakeFlowScoringDomain[] {
  return [
    { id: 'metabolic', name: 'Metabolic', weight: 1, enabled: true },
    { id: 'hormonal', name: 'Hormonal', weight: 1, enabled: true },
    { id: 'cardiovascular', name: 'Cardiovascular', weight: 1, enabled: true },
  ];
}

function createDefaultRiskBuckets(): IntakeFlowRiskBucket[] {
  return [
    {
      id: 'low',
      minScore: 0,
      maxScore: 5,
      label: 'Low',
      color: '#10b981',
      description: 'Minimal health concerns',
    },
    {
      id: 'moderate',
      minScore: 6,
      maxScore: 15,
      label: 'Moderate',
      color: '#f59e0b',
      description: 'Monitor and follow up on key findings',
    },
    {
      id: 'high',
      minScore: 16,
      maxScore: 100,
      label: 'High',
      color: '#ef4444',
      description: 'Significant health concerns needing prompt review',
    },
  ];
}

function createDefaultRecommendationPriority(): IntakeFlowRecommendationPriorityItem[] {
  return [
    { id: 'lifestyle_advice', label: 'Lifestyle Advice', order: 0 },
    { id: 'supplement_suggestion', label: 'Supplement Suggestion', order: 1 },
    { id: 'clinical_treatment', label: 'Clinical Treatment', order: 2 },
    { id: 'blood_retest', label: 'Blood Retest', order: 3 },
  ];
}

function createDefaultRiskHeadlineMappings(
  riskBuckets: IntakeFlowRiskBucket[],
): IntakeFlowRiskHeadlineMapping[] {
  return riskBuckets.map((bucket) => {
    if (bucket.id === 'low') {
      return {
        id: `headline_${bucket.id}`,
        riskBucketId: bucket.id,
        headline: 'Your health metrics look good',
        summary: 'Continue with your current lifestyle habits.',
      };
    }

    if (bucket.id === 'moderate') {
      return {
        id: `headline_${bucket.id}`,
        riskBucketId: bucket.id,
        headline: 'Some areas need attention',
        summary: 'We recommend making a few adjustments.',
      };
    }

    return {
      id: `headline_${bucket.id}`,
      riskBucketId: bucket.id,
      headline: 'Immediate action recommended',
      summary: 'Please consult with a healthcare provider soon.',
    };
  });
}

function createDefaultTagSignalMappings(): IntakeFlowTagSignalMapping[] {
  return [
    {
      id: 'tag_high_risk_metabolic',
      tag: 'high-risk-metabolic',
      insightParagraph: 'Personalized insight based on this tag',
    },
  ];
}

function createDefaultOutputMappingConfig(): IntakeFlowOutputMappingConfig {
  const riskBuckets = createDefaultRiskBuckets();

  return {
    recommendationPriority: createDefaultRecommendationPriority(),
    riskHeadlineMappings: createDefaultRiskHeadlineMappings(riskBuckets),
    tagSignalMappings: createDefaultTagSignalMappings(),
  };
}

function createDefaultBloodMarkerRules(): IntakeFlowBloodMarkerRule[] {
  return [
    {
      id: 'blood_marker_hba1c',
      marker: 'HbA1c',
      operator: '>',
      value: 6.5,
      actionType: 'ADD',
      scoreModifier: 6,
      targetDomainId: 'metabolic',
    },
  ];
}

function createDefaultRules(): IntakeFlowActionRule[] {
  return [
    {
      id: 'rule_1',
      name: 'Rule 1',
      conditionOperator: 'AND',
      actionOperator: 'AND',
      conditions: [
        {
          id: 'condition_1',
          type: 'TAG_EXISTS',
          value: 'high-risk-metabolic',
        },
      ],
      actions: [
        {
          id: 'action_1',
          type: 'INCLUDE_PATHWAY',
          value: 'Diabetes Management',
        },
      ],
    },
  ];
}

export function createDefaultScoringConfig(): IntakeFlowScoringConfig {
  return {
    domains: createDefaultDomains(),
    riskBuckets: createDefaultRiskBuckets(),
  };
}

export function createDefaultBloodEnhancedScoringConfig(): IntakeFlowScoringConfig {
  return {
    domains: createDefaultDomains(),
    riskBuckets: createDefaultRiskBuckets(),
    bloodMarkerRules: createDefaultBloodMarkerRules(),
    rules: createDefaultRules(),
    outputMapping: createDefaultOutputMappingConfig(),
  };
}

export function createDefaultScoringConfigForAssignment(
  assignedTo?: string | null,
): IntakeFlowScoringConfig | null {
  if (isBloodEnhancedIntake(assignedTo)) {
    return createDefaultBloodEnhancedScoringConfig();
  }

  if (isComprehensiveMedicalIntake(assignedTo)) {
    return createDefaultScoringConfig();
  }

  return null;
}

export function ensureScoringConfigForAssignment(
  assignedTo: string | null | undefined,
  scoringConfig: IntakeFlowScoringConfig | null | undefined,
): IntakeFlowScoringConfig | null {
  const defaultConfig = createDefaultScoringConfigForAssignment(assignedTo);
  if (!defaultConfig) {
    return null;
  }

  if (!scoringConfig) {
    return defaultConfig;
  }

  return {
    domains: scoringConfig.domains?.length ? scoringConfig.domains : defaultConfig.domains,
    riskBuckets: scoringConfig.riskBuckets?.length
      ? scoringConfig.riskBuckets
      : defaultConfig.riskBuckets,
    bloodMarkerRules: scoringConfig.bloodMarkerRules?.length
      ? scoringConfig.bloodMarkerRules
      : defaultConfig.bloodMarkerRules,
    rules: scoringConfig.rules?.length ? scoringConfig.rules : defaultConfig.rules,
    outputMapping:
      scoringConfig.outputMapping ??
      defaultConfig.outputMapping ??
      null,
  };
}
