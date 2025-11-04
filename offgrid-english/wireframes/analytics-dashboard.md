# Analytics Dashboard - Wireframe

## Overview
Table-based analytics showing completion, performance, transfer, validity, and feedback metrics.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  OffGrid English - Analytics                   [📥 Export CSV]  │
├─────────────────────────────────────────────────────────────────┤
│  App Version: 1.1.4    |    Last Updated: Oct 27, 2025, 12:17 AM│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─ 1. COMPLETION METRICS ────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Total Unique Sessions: 45                                 │ │
│  │  Avg Session Duration: 18.3 minutes                        │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Module          │Started│Finished│Complete%│Avg Time│  │ │
│  │  ├─────────────────┼───────┼────────┼─────────┼────────┤  │ │
│  │  │Tense & Form     │   42  │   38   │  90.5%  │ 22 min │  │ │
│  │  │Subj-Verb Agree. │   38  │   35   │  92.1%  │ 19 min │  │ │
│  │  │Prepositions     │   35  │   31   │  88.6%  │ 16 min │  │ │
│  │  │Word Order       │   31  │   28   │  90.3%  │ 17 min │  │ │
│  │  │Plurality        │   28  │   26   │  92.9%  │ 12 min │  │ │
│  │  │Articles         │   26  │   23   │  88.5%  │ 11 min │  │ │
│  │  │Auxiliaries      │   23  │   21   │  91.3%  │ 13 min │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Offline Completions: 93.4% (42/45 sessions)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ 2. PERFORMANCE METRICS ───────────────────────────────────┐ │
│  │                                                             │ │
│  │  Overall First-Attempt Accuracy: 67.8%                     │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Module          │Form A %│Form B %│Items│Avg Tries│  │ │
│  │  ├─────────────────┼────────┼────────┼─────┼─────────┤  │ │
│  │  │Tense & Form     │  64.2% │  59.1% │  50 │   1.4   │  │ │
│  │  │Subj-Verb Agree. │  68.5% │  62.8% │  40 │   1.3   │  │ │
│  │  │Prepositions     │  71.2% │  66.5% │  30 │   1.2   │  │ │
│  │  │Word Order       │  69.8% │  64.2% │  30 │   1.3   │  │ │
│  │  │Plurality        │  74.6% │  70.1% │  20 │   1.2   │  │ │
│  │  │Articles         │  66.3% │  61.7% │  20 │   1.4   │  │ │
│  │  │Auxiliaries      │  70.9% │  65.4% │  20 │   1.3   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Item Difficulty Heatmap (Top 10 Hardest Items):           │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Item ID         │Module       │Correct%│Attempts│   │  │ │
│  │  ├─────────────────┼─────────────┼────────┼────────┤   │  │ │
│  │  │tense-23-A       │Tense & Form │  31.2% │   45   │   │  │ │
│  │  │tense-18-B       │Tense & Form │  34.6% │   42   │   │  │ │
│  │  │prep-12-A        │Prepositions │  38.9% │   38   │   │  │ │
│  │  │sv-15-A          │Subj-Verb Ag.│  41.2% │   40   │   │  │ │
│  │  │articles-8-B     │Articles     │  43.5% │   35   │   │  │ │
│  │  │word-9-A         │Word Order   │  45.1% │   33   │   │  │ │
│  │  │tense-31-B       │Tense & Form │  46.8% │   41   │   │  │ │
│  │  │aux-7-A          │Auxiliaries  │  48.2% │   32   │   │  │ │
│  │  │prep-14-B        │Prepositions │  49.3% │   36   │   │  │ │
│  │  │plurality-6-A    │Plurality    │  50.7% │   30   │   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ 3. TRANSFER METRICS (Form A → Form B) ───────────────────┐ │
│  │                                                             │ │
│  │  Overall Transfer Rate: -5.2 pp (67.8% → 62.6%)           │ │
│  │  (Note: Negative pp-gains indicate learning didn't         │ │
│  │   transfer well to new contexts)                           │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Module          │Form A│Form B│pp-gain│Near%│Far% │  │ │
│  │  ├─────────────────┼──────┼──────┼───────┼─────┼─────┤  │ │
│  │  │Tense & Form     │64.2% │59.1% │ -5.1pp│62.3%│55.9%│  │ │
│  │  │Subj-Verb Agree. │68.5% │62.8% │ -5.7pp│65.1%│60.5%│  │ │
│  │  │Prepositions     │71.2% │66.5% │ -4.7pp│68.9%│64.1%│  │ │
│  │  │Word Order       │69.8% │64.2% │ -5.6pp│66.7%│61.7%│  │ │
│  │  │Plurality        │74.6% │70.1% │ -4.5pp│72.3%│67.9%│  │ │
│  │  │Articles         │66.3% │61.7% │ -4.6pp│63.8%│59.6%│  │ │
│  │  │Auxiliaries      │70.9% │65.4% │ -5.5pp│68.1%│62.7%│  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Legend:                                                    │ │
│  │  • pp-gain: Percentage point change (FormB% - FormA%)      │ │
│  │  • Near: Same difficulty, different wording               │ │
│  │  • Far: Different context, tests deeper understanding     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ 4. VALIDITY METRICS ──────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Teacher Agreement Rate: 91.7% (22/24 samples)             │ │
│  │  Valid Attempt Rate: 87.3%                                 │ │
│  │  (Valid = time on feedback ≥ 3s AND viewed feedback)       │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Module          │Agreement│Valid %│Validated│Total │  │ │
│  │  ├─────────────────┼─────────┼───────┼─────────┼──────┤  │ │
│  │  │Tense & Form     │  87.5%  │ 89.2% │    3    │  950 │  │ │
│  │  │Subj-Verb Agree. │  93.3%  │ 86.5% │    3    │  820 │  │ │
│  │  │Prepositions     │ 100.0%  │ 88.1% │    4    │  690 │  │ │
│  │  │Word Order       │  90.0%  │ 85.7% │    3    │  650 │  │ │
│  │  │Plurality        │  95.0%  │ 89.8% │    4    │  520 │  │ │
│  │  │Articles         │  88.9%  │ 84.3% │    3    │  480 │  │ │
│  │  │Auxiliaries      │  92.3%  │ 87.6% │    4    │  450 │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Avg Feedback Quality: 1.6/2.0 (between Adequate-Excellent)│ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─ 5. FEEDBACK-CYCLE METRICS ────────────────────────────────┐ │
│  │                                                             │ │
│  │  Feedback Engagement: 94.2% viewed feedback after errors   │ │
│  │  Retry Rate (within 72h): 23.6%                            │ │
│  │  Improvement on Retry: +31.4 pp (41.2% → 72.6%)           │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Module          │Viewed│Retry%│Re-check│Improve%│   │  │ │
│  │  ├─────────────────┼──────┼──────┼────────┼────────┤   │  │ │
│  │  │Tense & Form     │95.2% │24.8% │  89.3% │ +32.1pp│   │  │ │
│  │  │Subj-Verb Agree. │93.8% │22.1% │  91.2% │ +29.8pp│   │  │ │
│  │  │Prepositions     │95.6% │25.3% │  88.7% │ +34.2pp│   │  │ │
│  │  │Word Order       │92.9% │21.9% │  90.5% │ +28.5pp│   │  │ │
│  │  │Plurality        │96.1% │26.7% │  92.1% │ +35.6pp│   │  │ │
│  │  │Articles         │93.2% │20.8% │  87.9% │ +27.9pp│   │  │ │
│  │  │Auxiliaries      │94.7% │24.2% │  90.8% │ +33.2pp│   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Legend:                                                    │ │
│  │  • Viewed: % who viewed feedback after incorrect answer    │ │
│  │  • Retry%: % who retried same item within 72 hours        │ │
│  │  • Re-check: % who viewed result again after retry        │ │
│  │  • Improve%: pp-gain from first attempt to retry          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [📥 Export All Analytics CSV]                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## CSV Export Structure

### 1. analytics_completion.csv
```csv
module_id,module_name,started,finished,completion_rate,avg_time_min,offline_completions
tense-form,Tense & Form,42,38,90.5,22,40
subject-verb-agreement,Subject-Verb Agreement,38,35,92.1,19,36
...
```

### 2. analytics_performance.csv
```csv
module_id,form_a_accuracy,form_b_accuracy,total_items,avg_attempts,hardest_item
tense-form,64.2,59.1,50,1.4,tense-23-A
subject-verb-agreement,68.5,62.8,40,1.3,sv-15-A
...
```

### 3. analytics_transfer.csv
```csv
module_id,form_a_pct,form_b_pct,pp_gain,near_transfer_pct,far_transfer_pct
tense-form,64.2,59.1,-5.1,62.3,55.9
subject-verb-agreement,68.5,62.8,-5.7,65.1,60.5
...
```

### 4. analytics_validity.csv
```csv
module_id,teacher_agreement_rate,valid_attempt_rate,samples_validated,total_attempts,avg_feedback_quality
tense-form,87.5,89.2,3,950,1.7
subject-verb-agreement,93.3,86.5,3,820,1.6
...
```

### 5. analytics_feedback_cycle.csv
```csv
module_id,feedback_viewed_pct,retry_rate_72h,recheck_rate,improvement_pp
tense-form,95.2,24.8,89.3,32.1
subject-verb-agreement,93.8,22.1,91.2,29.8
...
```

---

## Calculation Formulas

### Completion Rate
```javascript
completionRate = (finished / started) * 100
```

### pp-gain (Percentage Point Gain)
```javascript
ppGain = formB_accuracy - formA_accuracy
// Negative values = performance dropped (no transfer)
// Positive values = improvement (successful transfer)
```

### Valid Attempt Rate
```javascript
validAttempt = (feedbackViewedAt !== null) &&
               (feedbackViewedAt - timestamp >= 3000) // 3+ seconds
validRate = (validAttempts / totalAttempts) * 100
```

### Feedback-Cycle Improvement
```javascript
// For each item that was retried:
firstAttemptAccuracy = correctOnFirstTry / totalFirstAttempts
retryAccuracy = correctOnRetry / totalRetries
improvementPP = retryAccuracy - firstAttemptAccuracy
```

### Teacher Agreement
```javascript
agreementRate = (agreementCount / totalValidated) * 100
```

---

## Design Principles

1. **Tables only**: No charts - easier to export, audit, and verify
2. **CSV-friendly**: Every table can be exported as structured data
3. **APP_VERSION**: Include in all exports for reproducibility
4. **Clear metrics**: Self-explanatory column headers
5. **Procurement-ready**: Simple, auditable data for institutional decision-makers
6. **Mobile-responsive**: Tables collapse or scroll horizontally on small screens
7. **Real-time updates**: Recalculate on page load from IndexedDB

---

## Implementation Notes

### Data Sources
- **Completion**: `db.attempts` grouped by `sessionId`, `moduleId`
- **Performance**: `db.attempts` with `isCorrect` aggregation
- **Transfer**: Compare `formType: 'A'` vs `formType: 'B'` accuracy
- **Validity**: Join `db.attempts` with `db.validation`
- **Feedback-cycle**: Track `retryAt`, `feedbackViewedAt` timestamps

### Update Trigger
```javascript
// Recalculate on:
// 1. Page load
// 2. New attempt added
// 3. Validation completed
useEffect(() => {
  calculateAllMetrics();
}, []);
```

### Performance Optimization
```javascript
// Use IndexedDB compound indices for fast queries:
db.attempts.where(['moduleId', 'formType']).equals(['tense-form', 'A'])
```

---

## Accessibility

- **Screen reader friendly**: Proper `<table>`, `<th>`, `<caption>` tags
- **Keyboard navigation**: Tab through tables, arrow keys within cells
- **High contrast**: WCAG 4.5:1 text-to-background ratio
- **Touch targets**: Export button ≥44px
