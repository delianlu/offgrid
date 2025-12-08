
import { z } from 'zod';

export const CommonErrorSchema = z.object({
  number: z.number().optional(),
  subTopic: z.string().optional(),
  wrong: z.string(),
  correct: z.string(),
  frenchConnection: z.string().optional()
});

export const ConsonantClusterSchema = z.object({
  cluster: z.string(),
  position: z.string(),
  clusterType: z.string(),
  words: z.array(z.string())
});

export const StressPatternSchema = z.object({
  word: z.string(),
  syllableBreak: z.array(z.string()),
  stressPattern: z.string(),
  stressedSyllableIndex: z.number(),
  partOfSpeech: z.string().optional(),
  note: z.string().optional()
});

export const StressPatternPairSchema = z.object({
  base: z.string(),
  noun: StressPatternSchema,
  verb: StressPatternSchema
});

export const PhonologyStressPatternsSchema = z.object({
  twoSyllableNounsAdjectives: z.array(StressPatternSchema).optional(),
  twoSyllableVerbs: z.array(StressPatternSchema).optional(),
  nounVerbPairs: z.array(z.union([StressPatternSchema, StressPatternPairSchema])).optional()
});

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  category: z.enum(['tense', 'agreement', 'prepositions', 'wordorder', 'plurality', 'articles', 'auxiliaries', 'scenarios', 'vocabulary', 'contrastive', 'phonology', 'grammar']),
  moduleIntroduction: z.union([
    z.string(),
    z.object({
      welcome: z.string(),
      theProblem: z.string(),
      thePromise: z.string()
    })
  ]).optional(),
  contrastiveExplanation: z.string().optional(),
  commonErrors: z.array(CommonErrorSchema).optional(),
  schema_version: z.string().optional(),
  module_version: z.string().optional(),
  consonantClusters: z.array(ConsonantClusterSchema).optional(),
  stressPatterns: z.union([
    z.array(z.string()),
    z.array(StressPatternSchema),
    z.array(StressPatternPairSchema),
    PhonologyStressPatternsSchema
  ]).optional()
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
});

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
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionText: z.string(),
  type: z.string().optional(),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  feedback: z.string(),
  formType: z.enum(['A', 'B']),
  transferType: z.enum(['near', 'far', 'negative', 'positive', 'overgeneralization']),
  item_version: z.string(),
  subTopic: z.string().optional(),
  correction: z.string().optional(),
  scenario: ScenarioSchema,
  frenchComparison: ContrastiveAnalysisSchema.optional(),
  falseCognate: FalseCognateSchema
});

export const AttemptSchema = z.object({
  id: z.string(),
  userId: z.string().optional(), // Added for multi-user support
  moduleId: z.string(),
  itemId: z.string(),
  formType: z.enum(['A', 'B']),
  transferType: z.enum(['near', 'far', 'negative', 'positive', 'overgeneralization']),
  studentAnswer: z.string(),
  isCorrect: z.boolean(),
  feedbackViewedAt: z.number().nullable(),
  retryAt: z.number().nullable(),
  sessionId: z.string(),
  timestamp: z.number()
});

export const ReviewDataSchema = z.object({
  itemId: z.string(), // Primary key
  userId: z.string().optional(), // Added for multi-user support
  easinessFactor: z.number(), // SM-2 algorithm ease factor (starts at 2.5)
  interval: z.number(), // Days until next review
  repetitions: z.number(), // Count of successful reviews
  lastReviewedAt: z.number().nullable(), // Timestamp of last review
  nextReviewAt: z.number().nullable(), // Timestamp when review is due
  difficultyScore: z.number() // 0-1 score (0 = easy, 1 = hard)
});

export const BookmarkSchema = z.object({
  itemId: z.string(), // Primary key
  userId: z.string().optional(), // Added for multi-user support
  moduleId: z.string(),
  bookmarkedAt: z.number(), // Timestamp
  note: z.string().optional() // Optional user note
});

export const MistakeJournalEntrySchema = z.object({
  id: z.string(), // Unique ID for this entry
  userId: z.string().optional(), // Added for multi-user support
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

export const FlagSchema = z.object({
  id: z.string(),
  userId: z.string().optional(), // Added for multi-user support
  itemId: z.string(),
  moduleId: z.string(),
  reason: z.enum(['wrong', 'confusing', 'inappropriate', 'other']),
  comment: z.string().optional(),
  timestamp: z.number(),
  status: z.enum(['open', 'resolved']).default('open')
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  avatar: z.string(), // Emoji or path
  pinHash: z.string().optional(), // bcrypt hash (optional for local-only)
  role: z.enum(['student', 'teacher']).default('student'),
  classIds: z.array(z.string()).default([]), // List of class IDs the student belongs to
  createdAt: z.number(),
  lastLoginAt: z.number().optional()
});

export const ClassroomSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  teacherId: z.string(),
  code: z.string().length(6), // Unique 6-character code
  createdAt: z.number(),
  description: z.string().optional()
});

export type Flag = z.infer<typeof FlagSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Classroom = z.infer<typeof ClassroomSchema>;
