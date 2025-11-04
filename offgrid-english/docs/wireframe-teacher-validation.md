# Teacher Validation Interface - Wireframe

## Purpose
Allow teachers to review a stratified sample (~20) of student responses and rate the automated feedback quality.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│ OffGrid English - Teacher Validation                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Sample Progress: 5 / 20 reviewed                        │
│ Agreement Rate: 80% (4/5 agree)                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Module: Subject-Verb Agreement                          │
│ Item #12 (Form A)                                       │
│                                                          │
│ Question:                                                │
│ "My father ___ in Douala."                              │
│   A) work                                                │
│   B) works  ✓                                            │
│   C) is working                                          │
│                                                          │
│ Student Answer: works                                    │
│ System Judgment: CORRECT                                 │
│                                                          │
│ System Feedback:                                         │
│ "Correct! The subject is 'My father' (he). For He,      │
│  She, or It in the present simple, we must add '-s'     │
│  to the verb."                                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Do you agree with the system judgment?                   │
│                                                          │
│  ○ Agree    ○ Disagree                                   │
│                                                          │
│ How would you rate the feedback quality?                 │
│                                                          │
│  ○ Poor (0)  ○ Acceptable (1)  ○ Good (2)               │
│                                                          │
│ Optional Notes:                                          │
│ ┌──────────────────────────────────────────────────┐    │
│ │                                                   │    │
│ └──────────────────────────────────────────────────┘    │
│                                                          │
│ [Skip]  [Submit & Next]                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Data Collected

For each reviewed item:
- `sample_id`: unique identifier
- `module_id`: which module
- `item_id`: which question
- `student_answer`: what the learner chose
- `system_correct`: boolean
- `teacher_agrees`: boolean (agree/disagree)
- `feedback_rating`: 0 (poor), 1 (acceptable), 2 (good)
- `teacher_notes`: optional text
- `timestamp`: when validated

## Export Format (validation.csv)

```csv
sample_id,module_id,item_id,student_answer,system_correct,teacher_agrees,feedback_rating,teacher_notes,timestamp
val-001,subject-verb-agreement,sva-1-A,works,true,true,2,"",2025-10-26T10:30:00Z
val-002,tense-form,tf-5-A,is studying,true,true,2,"",2025-10-26T10:31:15Z
val-003,prepositions,prep-3-A,in,false,false,1,"Should explain 'at' vs 'in' more clearly",2025-10-26T10:32:30Z
```

## UI/UX Considerations

1. **Stratified Sampling**: Automatically select ~20 items across all modules (proportional to module size)
2. **Progress Tracking**: Show X/20 reviewed and real-time agreement %
3. **Binary Judgment**: Simple agree/disagree (not asking teachers to re-grade)
4. **Optional Rating**: 0/1/2 scale for feedback quality
5. **Skip Button**: Allow skipping if teacher is unsure
6. **Mobile-Friendly**: Touch-friendly radio buttons (≥44px targets)
7. **Offline-First**: Save validations to IndexedDB, export as CSV

## Agreement Calculation

```
Agreement Rate = (# of "Agree" responses) / (# of total validations)
```

Display this prominently to show inter-rater reliability.
