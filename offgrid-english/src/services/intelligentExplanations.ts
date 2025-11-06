import { db } from '../db/database';
import type { Item, Attempt } from '../types/schemas';

export type ExplanationLevel = 'simple' | 'detailed' | 'expert';

export interface EnhancedExplanation {
  level: ExplanationLevel;
  summary: string; // One-sentence summary
  explanation: string; // Full explanation
  examples: string[]; // Example sentences
  commonMistakes: string[]; // What students often get wrong
  memoryTricks: string[]; // Mnemonic devices or tricks
  relatedConcepts: string[]; // Related grammar topics
  practiceHint: string; // How to practice this skill
}

/**
 * Determine appropriate explanation level based on user's performance
 */
export async function determineExplanationLevel(
  itemId: string,
  moduleId: string
): Promise<ExplanationLevel> {
  // Get user's attempts for this module
  const attempts = await db.attempts.where({ moduleId }).toArray();

  if (attempts.length < 5) return 'simple'; // Beginner

  // Calculate module accuracy
  const correct = attempts.filter(a => a.isCorrect).length;
  const accuracy = (correct / attempts.length) * 100;

  // Get attempts for this specific item
  const itemAttempts = attempts.filter(a => a.itemId === itemId);
  const itemAccuracy = itemAttempts.length > 0
    ? (itemAttempts.filter(a => a.isCorrect).length / itemAttempts.length) * 100
    : 0;

  // Expert level if overall high accuracy and item mastered
  if (accuracy > 85 && itemAccuracy > 80) return 'expert';

  // Detailed level if moderate performance
  if (accuracy > 60 || itemAccuracy > 50) return 'detailed';

  // Simple for struggling learners
  return 'simple';
}

/**
 * Generate explanation variations based on level
 */
export function generateExplanation(
  item: Item,
  userAnswer: string,
  level: ExplanationLevel
): EnhancedExplanation {
  const baseExplanation = item.feedback || 'This is the correct answer.';

  // Extract information from existing data
  const frenchComparison = item.frenchComparison;
  const scenario = item.scenario;
  const transferType = item.transferType;

  let explanation: EnhancedExplanation;

  switch (level) {
    case 'simple':
      explanation = {
        level: 'simple',
        summary: simplifyExplanation(baseExplanation),
        explanation: baseExplanation,
        examples: [item.correctAnswer],
        commonMistakes: getCommonMistakes(item, transferType),
        memoryTricks: getMemoryTricks(item, transferType),
        relatedConcepts: [],
        practiceHint: 'Practice similar sentences to build confidence.'
      };
      break;

    case 'detailed':
      explanation = {
        level: 'detailed',
        summary: simplifyExplanation(baseExplanation),
        explanation: enhanceExplanation(baseExplanation, frenchComparison),
        examples: generateExamples(item),
        commonMistakes: getCommonMistakes(item, transferType),
        memoryTricks: getMemoryTricks(item, transferType),
        relatedConcepts: getRelatedConcepts(item),
        practiceHint: 'Try creating your own sentences using this pattern.'
      };
      break;

    case 'expert':
      explanation = {
        level: 'expert',
        summary: 'Advanced analysis of this grammar structure',
        explanation: getExpertExplanation(item, frenchComparison),
        examples: generateAdvancedExamples(item),
        commonMistakes: getAdvancedMistakes(item),
        memoryTricks: [],
        relatedConcepts: getRelatedConcepts(item),
        practiceHint: 'Challenge yourself with edge cases and exceptions.'
      };
      break;
  }

  return explanation;
}

/**
 * Simplify explanation to one clear sentence
 */
function simplifyExplanation(explanation: string): string {
  // Extract first sentence
  const match = explanation.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : explanation.substring(0, 100) + '...';
}

/**
 * Enhance explanation with French comparison
 */
function enhanceExplanation(
  baseExplanation: string,
  frenchComparison?: any
): string {
  if (!frenchComparison) return baseExplanation;

  return `${baseExplanation}\n\n🇫🇷 French vs English:\n${frenchComparison.whyDifficult || ''}`;
}

/**
 * Get expert-level explanation
 */
function getExpertExplanation(item: Item, frenchComparison?: any): string {
  const linguistic = frenchComparison ? `\n\nLinguistic Analysis:\n${frenchComparison.whyDifficult || ''}` : '';

  return `${item.feedback}\n\nTransfer Type: ${item.transferType}\nThis tests ${getTransferTypeDescription(item.transferType)} transfer.${linguistic}`;
}

/**
 * Get transfer type description
 */
function getTransferTypeDescription(transferType: string): string {
  const descriptions = {
    near: 'direct',
    far: 'contextual',
    negative: 'interference-based',
    positive: 'beneficial',
    overgeneralization: 'rule extension'
  };
  return descriptions[transferType as keyof typeof descriptions] || transferType;
}

/**
 * Generate example sentences
 */
function generateExamples(item: Item): string[] {
  const examples = [item.correctAnswer];

  // Generate variations based on the correct answer
  // This is simplified - in production, you'd have a richer example database
  if (item.correctAnswer.includes('is')) {
    examples.push(item.correctAnswer.replace('is', 'was'));
  }

  return examples;
}

/**
 * Generate advanced examples with edge cases
 */
function generateAdvancedExamples(item: Item): string[] {
  const examples = generateExamples(item);

  // Add edge cases
  examples.push(`Note: Check for exceptions in formal vs informal contexts.`);

  return examples;
}

/**
 * Get common mistakes for this transfer type
 */
function getCommonMistakes(item: Item, transferType: string): string[] {
  const mistakes: Record<string, string[]> = {
    near: [
      'Watch for false cognates',
      'Don\'t assume same word order'
    ],
    far: [
      'Context matters - same rule, different situation',
      'Check if exceptions apply'
    ],
    negative: [
      'This is NOT like French!',
      'Resist the urge to translate directly'
    ],
    positive: [
      'This works like French, but double-check context',
      'Similar but not identical'
    ],
    overgeneralization: [
      'Not all cases follow this pattern',
      'Check for exceptions'
    ]
  };

  return mistakes[transferType] || ['Watch for context clues'];
}

/**
 * Get advanced mistake patterns
 */
function getAdvancedMistakes(item: Item): string[] {
  return [
    'Advanced learners often overlook subtle register differences',
    'Be aware of prescriptive vs descriptive grammar rules'
  ];
}

/**
 * Get memory tricks specific to transfer type
 */
function getMemoryTricks(item: Item, transferType: string): string[] {
  const tricks: Record<string, string[]> = {
    near: [
      '💡 Think: "Almost the same, but..."',
      '🎯 Focus on the small difference'
    ],
    far: [
      '🌍 Imagine the context first',
      '🔄 Different situation, same rule'
    ],
    negative: [
      '🚫 Remember: French does this differently',
      '🔄 Reverse your instinct'
    ],
    positive: [
      '✅ This one\'s similar to French',
      '🤝 Let French help you remember'
    ],
    overgeneralization: [
      '⚠️ Not ALWAYS true',
      '🎯 Check for special cases'
    ]
  };

  return tricks[transferType] || ['💡 Practice makes perfect'];
}

/**
 * Get related grammar concepts
 */
function getRelatedConcepts(item: Item): string[] {
  // Based on module ID, suggest related topics
  const moduleId = item.moduleId;

  const related: Record<string, string[]> = {
    'tense-form': ['subject-verb-agreement', 'auxiliaries'],
    'subject-verb-agreement': ['tense-form', 'plurality'],
    'prepositions': ['word-order', 'articles'],
    'word-order': ['prepositions', 'auxiliaries'],
    'plurality': ['subject-verb-agreement', 'articles'],
    'articles': ['plurality', 'prepositions'],
    'auxiliaries': ['tense-form', 'word-order']
  };

  return related[moduleId] || [];
}

/**
 * Get dynamic explanation based on error pattern
 */
export async function getErrorPatternExplanation(
  itemId: string,
  moduleId: string
): Promise<string> {
  // Get recent attempts for this item
  const attempts = await db.attempts.where({ itemId }).toArray();

  if (attempts.length === 0) return '';

  const recentAttempts = attempts.slice(-5);
  const failureCount = recentAttempts.filter(a => !a.isCorrect).length;

  if (failureCount >= 3) {
    return '⚠️ This question is challenging for you. Take your time and review the explanation carefully.';
  } else if (failureCount === 0) {
    return '🎉 You\'ve mastered this concept! Keep up the great work.';
  }

  return '';
}

/**
 * Suggest next steps based on performance
 */
export async function suggestNextSteps(moduleId: string): Promise<string[]> {
  const attempts = await db.attempts.where({ moduleId }).toArray();

  if (attempts.length < 5) {
    return ['Continue practicing to build confidence'];
  }

  const correct = attempts.filter(a => a.isCorrect).length;
  const accuracy = (correct / attempts.length) * 100;

  if (accuracy >= 90) {
    return [
      'You\'re ready for the next module',
      'Try the challenge mode for this topic'
    ];
  } else if (accuracy >= 70) {
    return [
      'Review your mistakes in the Mistake Journal',
      'Practice the areas where you struggled'
    ];
  } else {
    return [
      'Review the module introduction',
      'Focus on one concept at a time',
      'Don\'t rush - understanding is more important than speed'
    ];
  }
}
