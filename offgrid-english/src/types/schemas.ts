import { z } from 'zod';

export const CommonErrorSchema = z.object({
  number: z.number(),
  subTopic: z.string().optional(),
  wrong: z.string(),
  correct: z.string(),
  frenchConnection: z.string()
});

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['tense','agreement','prepositions','wordorder','plurality','articles','auxiliaries','scenarios','vocabulary','contrastive']),
  moduleIntroduction: z.string().optional(),
  contrastiveExplanation: z.string().optional(),
  commonErrors: z.array(CommonErrorSchema).optional(),
  schema_version: z.literal('1'),
  module_version: z.string()
});

export const ScenarioSchema = z.object({
  name: z.string(),
  icon: z.string(),
  context: z.string(),
  characters: z.array(z.string())
}).optional();

export const ContrastiveAnalysisSchema = z.object({
  frenchStructure: z.string(),
  englishStructure: z.string(),
  whyDifficult: z.string(),
  visualHighlighting: z.object({
    incorrect: z.string(),
    correct: z.string()
  })
}).optional();

export const FalseCognateSchema = z.object({
  englishWord: z.string(),
  frenchWord: z.string(),
  frenchMeaning: z.string(),
  englishMeaning: z.string(),
  commonMistake: z.string(),
  memoryTrick: z.string()
}).optional();

export const ItemSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  questionText: z.string(),
  type: z.string().optional(),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  feedback: z.string(),
  formType: z.enum(['A','B']),
  transferType: z.enum(['near','far','negative','positive','overgeneralization']),
  item_version: z.string(),
  subTopic: z.string().optional(),
  correction: z.string().optional(),
  scenario: ScenarioSchema,
  frenchComparison: ContrastiveAnalysisSchema,
  falseCognate: FalseCognateSchema
});

export const AttemptSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  itemId: z.string(),
  formType: z.enum(['A','B']),
  transferType: z.enum(['near','far','negative','positive','overgeneralization']),
  studentAnswer: z.string(),
  isCorrect: z.boolean(),
  feedbackViewedAt: z.number().nullable(),
  retryAt: z.number().nullable(),
  sessionId: z.string(),
  timestamp: z.number()
});

export const ReviewDataSchema = z.object({
  itemId: z.string(), // Primary key
  easinessFactor: z.number(), // SM-2 algorithm ease factor (starts at 2.5)
  interval: z.number(), // Days until next review
  repetitions: z.number(), // Count of successful reviews
  lastReviewedAt: z.number().nullable(), // Timestamp of last review
  nextReviewAt: z.number().nullable(), // Timestamp when review is due
  difficultyScore: z.number() // 0-1 score (0 = easy, 1 = hard)
});

export const BookmarkSchema = z.object({
  itemId: z.string(), // Primary key
  moduleId: z.string(),
  bookmarkedAt: z.number(), // Timestamp
  note: z.string().optional() // Optional user note
});

export const MistakeJournalEntrySchema = z.object({
  id: z.string(), // Unique ID for this entry
  itemId: z.string(), // Reference to the item
  moduleId: z.string(), // Reference to the module
  questionText: z.string(), // The question that was answered
  studentAnswer: z.string(), // What the student answered
  correctAnswer: z.string(), // The correct answer
  timestamp: z.number(), // When the mistake was made
  attemptCount: z.number(), // How many times this mistake was made
  lastSeenAt: z.number(), // Last time this mistake occurred
  resolved: z.boolean() // Whether the student has mastered this
});

export type CommonError = z.infer<typeof CommonErrorSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type ContrastiveAnalysis = z.infer<typeof ContrastiveAnalysisSchema>;
export type FalseCognate = z.infer<typeof FalseCognateSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Attempt = z.infer<typeof AttemptSchema>;
export type ReviewData = z.infer<typeof ReviewDataSchema>;
export type Bookmark = z.infer<typeof BookmarkSchema>;
export type MistakeJournalEntry = z.infer<typeof MistakeJournalEntrySchema>;
