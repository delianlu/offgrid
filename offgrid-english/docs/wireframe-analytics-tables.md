# Analytics Tables - Wireframe

## Purpose
Display key learning metrics in simple, table-based format (no charts/visualizations for v1).

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ OffGrid English - Analytics Dashboard                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [Export All Data as CSV]    Last Updated: 2025-10-26 10:45   │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. COMPLETION METRICS                                        │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Module               Started  Finished  Completion %  │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ Tense & Form         Yes      Yes       100%          │   │
│ │ Subject-Verb Agr.    Yes      No        45%           │   │
│ │ Prepositions         Yes      No        30%           │   │
│ │ Word Order           No       No        0%            │   │
│ │ Plurality            No       No        0%            │   │
│ │ Articles             No       No        0%            │   │
│ │ Auxiliaries          No       No        0%            │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ TOTAL                3/7      1/7       25%           │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 2. PERFORMANCE (First-Attempt Accuracy)                      │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Module               Form A    Form B    Difficulty   │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ Tense & Form         85%       78%       Medium       │   │
│ │ Subject-Verb Agr.    72%       —         —            │   │
│ │ Prepositions         65%       —         —            │   │
│ │ Word Order           —         —         —            │   │
│ │ Plurality            —         —         —            │   │
│ │ Articles             —         —         —            │   │
│ │ Auxiliaries          —         —         —            │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 3. TRANSFER (Form A → Form B Performance Gain)               │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Module               Near Items  Far Items  PP-Gain   │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ Tense & Form         +12 pp      +8 pp      Good      │   │
│ │ Subject-Verb Agr.    —           —          —         │   │
│ │ Prepositions         —           —          —         │   │
│ │ Word Order           —           —          —         │   │
│ │ Plurality            —           —          —         │   │
│ │ Articles             —           —          —         │   │
│ │ Auxiliaries          —           —          —         │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
│ Note: PP-gain = (Form B %) - (Form A %). Positive =          │
│ learning transferred to new items.                            │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 4. VALIDITY & ENGAGEMENT                                     │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Metric                           Value                 │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ Total Attempts                   145                   │   │
│ │ Valid Attempts*                  138 (95%)             │   │
│ │ Teacher Agreement Rate           87%                   │   │
│ │ Avg Time per Item                34 seconds            │   │
│ │ Feedback Viewed                  98%                   │   │
│ │ Retry After Feedback             42%                   │   │
│ │                                                        │   │
│ │ *Valid = spent >5s AND viewed feedback                │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 5. ITEM DIFFICULTY HEATMAP (Table Format)                    │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Item ID          Accuracy  N    Difficulty  Notes      │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ tf-1-A           92%       12   Easy        ✓          │   │
│ │ tf-2-A           85%       12   Medium      ✓          │   │
│ │ tf-3-A           45%       12   Hard        Review     │   │
│ │ tf-4-A           71%       12   Medium      ✓          │   │
│ │ ...                                                    │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                               │
│ Color Legend: Easy (>80%), Medium (60-80%), Hard (<60%)      │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [Export Attempts CSV]  [Export Validation CSV]               │
│ [Export Analytics Summary CSV]                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Data Calculations

### 1. Completion Metrics
- **Started**: `attemptCount > 0` for any item in module
- **Finished**: Completed all Form A items in module
- **Completion %**: `(items_completed / total_items) * 100`

### 2. Performance
- **Form A Accuracy**: `correct_first_attempts / total_form_a_attempts`
- **Form B Accuracy**: `correct_form_b_attempts / total_form_b_attempts`
- **Difficulty**: Easy (>80%), Medium (60-80%), Hard (<60%)

### 3. Transfer (PP-Gains)
- **Near Transfer**: `(Form B near items %) - (Form A parallel items %)`
- **Far Transfer**: `(Form B far items %) - (Form A parallel items %)`
- **PP-Gain Interpretation**:
  - Good: +10pp or more
  - Moderate: +5pp to +10pp
  - Weak: <+5pp

### 4. Validity
- **Valid Attempt**: `timeSpent > 5000ms AND feedbackViewed === true`
- **Teacher Agreement**: From teacher validation interface
- **Retry After Feedback**: `retryCount > 0 AND previousAttempt.sawFeedback`

### 5. Item Difficulty Heatmap
- **Accuracy**: Per-item first-attempt success rate
- **N**: Number of attempts for that item
- **Difficulty Category**: Based on accuracy thresholds
- **Notes**: Flag items <60% for content review

## CSV Export Formats

### attempts.csv
```csv
id,itemId,studentAnswer,isCorrect,timestamp,retryCount,timeSpent,feedbackViewed
att-001,tf-1-A,prepares,true,2025-10-26T10:00:00Z,0,12500,true
att-002,tf-2-A,is studying,true,2025-10-26T10:01:30Z,1,18200,true
```

### analytics_summary.csv
```csv
metric,value,app_version,timestamp
total_modules,7,1.0.0,2025-10-26T10:45:00Z
modules_started,3,1.0.0,2025-10-26T10:45:00Z
modules_finished,1,1.0.0,2025-10-26T10:45:00Z
total_attempts,145,1.0.0,2025-10-26T10:45:00Z
valid_attempts,138,1.0.0,2025-10-26T10:45:00Z
teacher_agreement_rate,0.87,1.0.0,2025-10-26T10:45:00Z
avg_time_per_item_ms,34000,1.0.0,2025-10-26T10:45:00Z
```

## UI/UX Considerations

1. **Tables Only (No Charts)**: Keep it simple for v1.0
2. **Clear Headers**: Include APP_VERSION in all exports
3. **Mobile-Responsive**: Horizontal scroll on small screens
4. **Export Buttons**: Prominent, one-click CSV downloads
5. **Real-Time Updates**: Refresh after completing a module
6. **Color Coding**: Use subtle background colors for difficulty levels
7. **Offline-First**: All calculations happen client-side

## Performance Notes

- All analytics calculated from IndexedDB queries (no backend)
- Cache calculations and update on new attempts
- Use Web Workers for heavy calculations (if needed)
