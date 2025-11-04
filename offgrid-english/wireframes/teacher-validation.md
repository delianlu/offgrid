# Teacher Validation Interface - Wireframe

## Overview
Interface for teachers to validate automated scoring of ~20 stratified sample responses.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  OffGrid English - Teacher Validation                    [Exit] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Progress: [████████████░░░░░░░░] 12 of 20 reviewed             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Sample #12 - Module: Prepositions - Item #7                 ││
│  │                                                              ││
│  │ Question:                                                    ││
│  │ "Please wait for me ___ the motor park entrance."           ││
│  │                                                              ││
│  │ Options: [at, on, in]                                        ││
│  │                                                              ││
│  │ ┌────────────────────────────────────────────────────────┐  ││
│  │ │ Student Answer: "at"                                    │  ││
│  │ │ Correct Answer: "at"                                    │  ││
│  │ │ System Scored: ✓ CORRECT                               │  ││
│  │ └────────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │ Feedback shown to student:                                   ││
│  │ "Correct! We use AT to talk about a specific point or       ││
│  │  location (at the entrance, at the bus stop, at the         ││
│  │  market)."                                                   ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Do you agree with the automated scoring?                        │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  ✓ Agree         │  │  ✗ Disagree      │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                   │
│  (Optional) Rate feedback quality:                               │
│  ○ Excellent (2)  ○ Adequate (1)  ○ Poor (0)  [Skip]           │
│                                                                   │
│  (Optional) Notes:                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  [← Previous]                                    [Next →]        │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Summary:                                                         │
│  Agreement Rate: 91.7% (11/12 agreed)                            │
│  Avg Feedback Quality: 1.8/2.0 (Excellent-Adequate)             │
│                                                                   │
│  [📥 Export Validation CSV]                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### Sampling Strategy
- **Stratified by module**: ~20 total responses, distributed across all 7 grammar categories
- **Mix of correct/incorrect**: Include both to validate scoring accuracy

### Binary Scoring
- **Agree/Disagree** buttons (required)
- No middle ground - forces clear judgment

### Optional Feedback Quality (0/1/2 scale)
- **0 (Poor)**: Confusing or incorrect explanation
- **1 (Adequate)**: Technically correct but could be clearer
- **2 (Excellent)**: Clear, helpful, culturally appropriate

### Optional Notes Field
- Free text for specific concerns or suggestions
- Not required to maintain low friction

### Progress Indicator
- Shows X of 20 reviewed
- Visual progress bar
- Summary statistics update in real-time

### Navigation
- Previous/Next buttons
- Can skip around if needed
- Auto-saves on each judgment

---

## Data Export (validation.csv)

```csv
sample_id,module_id,item_id,question_text,student_answer,correct_answer,system_score,teacher_score,agreement,feedback_rating,teacher_notes,timestamp
val_001,prepositions,prep-7-A,"Please wait for me ___ the motor park entrance.",at,at,correct,correct,true,2,"Clear and helpful",1730000001000
val_002,tense-form,tense-15-A,"Yesterday, I ___ to the market.",go,went,incorrect,incorrect,true,1,"Could mention -ed past tense more clearly",1730000002000
...
```

### CSV Fields
- **sample_id**: Unique validation attempt ID
- **module_id**: Grammar category
- **item_id**: Specific question
- **question_text**: The actual question
- **student_answer**: What learner selected
- **correct_answer**: The right answer
- **system_score**: correct/incorrect (automated)
- **teacher_score**: correct/incorrect (human judgment)
- **agreement**: true/false (system == teacher)
- **feedback_rating**: 0/1/2 or null if skipped
- **teacher_notes**: Free text or empty
- **timestamp**: When validation occurred

---

## Implementation Notes

### Stratified Sampling Logic
```javascript
// Pseudo-code
const samplesPerModule = Math.floor(20 / 7); // ~2-3 per module
const samples = [];

for (const module of modules) {
  const moduleAttempts = attempts.filter(a => a.moduleId === module.id);
  const stratified = [
    ...moduleAttempts.filter(a => a.isCorrect).slice(0, samplesPerModule/2),
    ...moduleAttempts.filter(a => !a.isCorrect).slice(0, samplesPerModule/2)
  ];
  samples.push(...stratified);
}
```

### Agreement Rate Calculation
```javascript
const agreementRate = (validations.filter(v => v.agreement).length / validations.length) * 100;
```

---

## Design Principles

1. **Minimal friction**: Binary choice is fast, optional fields don't block progress
2. **Context-rich**: Show question, both answers, feedback - teacher has full context
3. **Real-time feedback**: Summary updates as teacher works
4. **Transparent**: Export shows raw data for institutional review
5. **Mobile-friendly**: Large touch targets (≥44px) for shared tablets
