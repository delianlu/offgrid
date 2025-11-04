# Wireframes for Milestone 1 (Week 10)

This directory contains wireframe documentation for the two major features due in Week 11-13.

## Files

### 1. `teacher-validation.md`
**Teacher Validation Interface** - Allows ESL educators to validate automated scoring.

**Key Features:**
- Binary agree/disagree scoring (required)
- Optional 0/1/2 feedback quality rating
- Stratified sampling (~20 responses across all 7 modules)
- Real-time agreement rate calculation
- CSV export with full validation data

**Design Highlights:**
- Low friction (binary choice is fast)
- Context-rich (shows question, answers, feedback)
- Mobile-friendly (large touch targets ≥44px)
- Transparent (raw CSV export for institutional audit)

### 2. `analytics-dashboard.md`
**Analytics Dashboard** - Table-based metrics showing learning outcomes.

**5 Metric Categories:**
1. **Completion**: Modules started/finished, offline %, avg time
2. **Performance**: First-attempt accuracy, item difficulty heatmap
3. **Transfer**: pp-gains from Form A → Form B (near/far)
4. **Validity**: Teacher agreement %, valid attempt rate
5. **Feedback-cycle**: % who viewed → retried → improved

**Design Highlights:**
- Tables only (no charts) - easier to export/audit
- All metrics exportable as separate CSVs
- APP_VERSION included in all exports
- Procurement-friendly for institutional decision-makers

## Implementation Timeline

Per project proposal:

- **Week 10 (Current)**: ✅ Wireframes complete
- **Week 11**: Implement Teacher Validation Interface
- **Week 11**: Implement Analytics Dashboard (tables)
- **Week 13**: Milestone 2 (all features complete)

## How to Use These Wireframes

### For Development
1. Follow the ASCII layout diagrams for UI structure
2. Use the calculation formulas for metric computation
3. Refer to CSV export schemas for data structure
4. Follow accessibility guidelines (WCAG 4.5:1, ≥44px targets)

### For Milestone 1 Video
- Show these wireframes as "planned next features"
- Explain the teacher validation sampling strategy
- Describe the 5 analytics categories
- Mention CSV export for institutional transparency

## Design Principles (Both Interfaces)

1. **Offline-first**: All calculations from local IndexedDB
2. **Transparent**: Raw data exports for auditing
3. **Low friction**: Fast workflows for teachers
4. **Mobile-friendly**: Large touch targets, responsive tables
5. **Procurement-ready**: CSV over dashboards
6. **Accessible**: WCAG 2.1 AA compliance

## Questions for Expert Review (Week 15)

When showing these wireframes to 3-5 ESL educators:

1. Is the binary agree/disagree sufficient, or do you need more granularity?
2. Is the 0/1/2 feedback quality scale clear?
3. Are the 5 analytics categories (completion, performance, transfer, validity, feedback-cycle) useful for classroom decisions?
4. Would you prefer different metrics or groupings?
5. Is CSV export sufficient, or do you need built-in visualizations?

## Technical Notes

### Teacher Validation Sampling
```javascript
// Stratified: ~3 samples per module, mix of correct/incorrect
const samplesPerModule = Math.floor(20 / 7);
const samples = modules.flatMap(mod => [
  ...correctAttempts(mod).slice(0, samplesPerModule/2),
  ...incorrectAttempts(mod).slice(0, samplesPerModule/2)
]);
```

### pp-gain Calculation (Transfer Metric)
```javascript
// Percentage point gain = FormB% - FormA%
// Negative = no transfer (learning didn't stick)
// Positive = successful transfer to new contexts
const ppGain = formBAccuracy - formAAccuracy;
```

### Valid Attempt Definition
```javascript
// Attempt is "valid" if:
// 1. Student viewed feedback
// 2. Spent ≥3 seconds on feedback screen
const isValid = (feedbackViewedAt !== null) &&
                (feedbackViewedAt - timestamp >= 3000);
```

## Folder Structure After Implementation

```
src/
├── pages/
│   ├── Diagnostics.tsx       ✅ Done (Week 7)
│   ├── ModuleLearning.tsx    ✅ Done (Week 9)
│   ├── ModulePractice.tsx    ✅ Done (Week 9)
│   ├── TeacherValidation.tsx ⏳ Week 11
│   └── Analytics.tsx         ⏳ Week 11
├── components/
│   ├── ValidationSample.tsx  ⏳ Week 11
│   └── MetricsTable.tsx      ⏳ Week 11
└── utils/
    ├── sampling.ts           ⏳ Week 11
    └── metrics.ts            ⏳ Week 11
```

---

Created: October 27, 2025
For: CS 6460 Milestone 1 (Week 10)
Project: OffGrid English - Offline-First English Learning for Cameroon
