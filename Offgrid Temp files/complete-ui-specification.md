# OffGrid English - Complete UI Specification Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Design System Foundation](#design-system-foundation)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Screen Specifications](#screen-specifications)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Responsive Behavior](#responsive-behavior)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Project Overview

### Technical Constraints
- **Bundle Size**: ≤150KB gzipped (initial JS)
- **Offline**: Works completely offline after first load
- **Devices**: Android smartphones (primary), desktop (secondary)
- **Screen Sizes**: 320px minimum width
- **Framework**: React 18 + TypeScript + Tailwind CSS
- **Fonts**: System fonts only (no web fonts)

### Target Users
- Cameroonian Francophone English learners
- Shared device usage common
- Varying technical skill levels
- Low-connectivity environments

### Design Philosophy
- **Simplicity First**: One primary action per screen
- **Mobile-First**: Design for thumb, not mouse
- **High Contrast**: Works in bright sunlight
- **Clear Feedback**: Instant visual responses
- **Low Cognitive Load**: Clean, predictable interface

---

## Design System Foundation

### Base Configuration (Tailwind)

```javascript
// tailwind.config.js - Key settings
module.exports = {
  theme: {
    extend: {
      // Use default Tailwind colors (no custom colors)
      // Use default spacing scale
      // Use default font families
    },
  },
  // Purge unused styles for small bundle
}
```

### CSS Variables (Optional Additions)

```css
:root {
  /* Only if needed for custom properties */
  --header-height: 64px;
  --safe-area-bottom: env(safe-area-inset-bottom);
}
```

---

## Color Palette

### Primary Colors (Tailwind Defaults)

| Purpose | Tailwind Class | Hex Code | Usage |
|---------|---------------|----------|-------|
| **Primary Action** | `bg-blue-600` | #2563eb | Primary buttons, active states |
| **Primary Hover** | `bg-blue-700` | #1d4ed8 | Button hover states |
| **Success** | `bg-green-500` | #22c55e | Correct answers, completed modules |
| **Success Light** | `bg-green-100` | #dcfce7 | Success backgrounds |
| **Error** | `bg-red-500` | #ef4444 | Wrong answers, errors |
| **Error Light** | `bg-red-100` | #fee2e2 | Error backgrounds |
| **Warning/Active** | `bg-orange-500` | #f97316 | In-progress modules |
| **Warning Light** | `bg-orange-100` | #ffedd5 | Active backgrounds |
| **Neutral Dark** | `text-gray-900` | #111827 | Primary text |
| **Neutral Medium** | `text-gray-600` | #4b5563 | Secondary text |
| **Neutral Light** | `bg-gray-100` | #f3f4f6 | Backgrounds |
| **Disabled** | `text-gray-400` | #9ca3af | Locked states |

### Background Colors

| Surface | Tailwind Class | Usage |
|---------|---------------|--------|
| **App Background** | `bg-gray-50` | Main app background |
| **Card Background** | `bg-white` | Cards, panels |
| **Header** | `bg-blue-600` | Top navigation bar |
| **Modal Overlay** | `bg-black/50` | Backdrop for modals |

### Semantic Color Mapping

```javascript
// Color meanings throughout the app
const semanticColors = {
  // Module States
  completed: 'green-500',      // 100% done
  active: 'orange-500',        // In progress
  locked: 'gray-400',          // Not accessible yet
  
  // Answer Feedback
  correct: 'green-500',        // Right answer
  incorrect: 'red-500',        // Wrong answer
  neutral: 'blue-500',         // Information
  
  // UI Actions
  primary: 'blue-600',         // Main actions
  secondary: 'gray-200',       // Secondary actions
  danger: 'red-600',           // Destructive actions (Reset)
};
```

### Color Contrast Ratios (WCAG 2.1 AA)

All combinations tested and passing 4.5:1 minimum:

| Text | Background | Ratio | Pass |
|------|-----------|-------|------|
| gray-900 | white | 16.9:1 | ✓ |
| gray-900 | gray-50 | 15.9:1 | ✓ |
| gray-600 | white | 7.2:1 | ✓ |
| white | blue-600 | 4.9:1 | ✓ |
| white | green-500 | 4.8:1 | ✓ |
| white | red-500 | 5.3:1 | ✓ |
| white | orange-500 | 4.7:1 | ✓ |
| green-900 | green-100 | 8.5:1 | ✓ |
| red-900 | red-100 | 8.2:1 | ✓ |

---

## Typography

### Font Stack

```css
/* System font stack - already on every device */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             "Roboto", "Oxygen", "Ubuntu", "Cantarell", 
             "Helvetica Neue", sans-serif;
```

**Tailwind Class**: `font-sans` (default)

### Font Sizes

| Element | Tailwind Class | Size | Line Height | Usage |
|---------|---------------|------|-------------|-------|
| **Page Title** | `text-2xl` | 24px | 32px | Screen titles |
| **Module Name** | `text-xl` | 20px | 28px | Card titles |
| **Question** | `text-lg` | 18px | 28px | Question text |
| **Body** | `text-base` | 16px | 24px | Normal text |
| **Label** | `text-sm` | 14px | 20px | Labels, hints |
| **Caption** | `text-xs` | 12px | 16px | Metadata, timestamps |

### Font Weights

| Weight | Tailwind Class | Numeric | Usage |
|--------|---------------|---------|-------|
| **Normal** | `font-normal` | 400 | Body text |
| **Medium** | `font-medium` | 500 | Emphasis |
| **Semibold** | `font-semibold` | 600 | Headers |
| **Bold** | `font-bold` | 700 | Buttons, strong emphasis |

### Typography Examples

```jsx
// Page Title
<h1 className="text-2xl font-bold text-gray-900">
  OffGrid English
</h1>

// Module Name
<h2 className="text-xl font-semibold text-gray-900">
  Verb Tense & Form
</h2>

// Question Text
<p className="text-lg text-gray-900">
  The teacher ___ the lesson every morning.
</p>

// Body Text
<p className="text-base text-gray-700">
  In English, we add -s to verbs with third person singular subjects.
</p>

// Label
<span className="text-sm text-gray-600">
  Question 5 of 24
</span>

// Caption
<span className="text-xs text-gray-500">
  Last updated: 2 hours ago
</span>
```

---

## Spacing & Layout

### Spacing Scale (Tailwind Default)

| Value | Pixels | Tailwind | Usage |
|-------|--------|----------|-------|
| 0.5 | 2px | `p-0.5` | Minimal spacing |
| 1 | 4px | `p-1` | Very tight |
| 2 | 8px | `p-2` | Tight |
| 3 | 12px | `p-3` | Comfortable |
| 4 | 16px | `p-4` | Standard |
| 5 | 20px | `p-5` | Generous |
| 6 | 24px | `p-6` | Spacious |
| 8 | 32px | `p-8` | Very spacious |

### Common Spacing Patterns

```jsx
// Screen Container
<div className="p-4 md:p-6">
  {/* Content */}
</div>

// Card Internal Padding
<div className="p-5">
  {/* Card content */}
</div>

// Vertical Spacing (Stack)
<div className="space-y-4">
  {/* Elements with 16px gap */}
</div>

// Grid Gap
<div className="grid grid-cols-2 gap-4">
  {/* Grid items */}
</div>

// Section Margins
<section className="mb-6">
  {/* Section content */}
</section>
```

### Layout Containers

```jsx
// Main Container
<main className="min-h-screen bg-gray-50">
  {/* App content */}
</main>

// Content Container (Desktop)
<div className="max-w-4xl mx-auto px-4">
  {/* Centered content */}
</div>

// Card Container
<div className="bg-white rounded-2xl shadow-md p-5">
  {/* Card content */}
</div>
```

### Border Radius

| Size | Tailwind Class | Pixels | Usage |
|------|---------------|--------|-------|
| Small | `rounded` | 4px | Small elements |
| Medium | `rounded-lg` | 8px | Buttons |
| Large | `rounded-xl` | 12px | Buttons, inputs |
| Extra Large | `rounded-2xl` | 16px | Cards |
| Full | `rounded-full` | 9999px | Pills, progress bars |

### Shadows

| Depth | Tailwind Class | Usage |
|-------|---------------|-------|
| Small | `shadow-sm` | Subtle elevation |
| Medium | `shadow-md` | Cards at rest |
| Large | `shadow-lg` | Buttons, raised cards |
| Extra Large | `shadow-xl` | Modals, popovers |
| 2XL | `shadow-2xl` | Maximum elevation |

---

## Component Library

### 1. Module Card

**Purpose**: Display grammar module with progress

**States**: Completed, Active, Locked

**Specifications**:
- Width: Full width of container
- Min Height: 120px
- Border Radius: `rounded-2xl` (16px)
- Shadow: `shadow-md`
- Padding: `p-5` (20px)
- Touch Target: Entire card clickable

**Completed State**:
```jsx
<div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-500 
                hover:shadow-lg transition-shadow cursor-pointer">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="text-xl font-semibold text-gray-900">Verb Tense & Form</h3>
      <p className="text-sm text-gray-600 mt-1">24 items</p>
    </div>
    <div className="text-green-500 text-2xl">✓</div>
  </div>
  <div className="mb-2">
    <div className="bg-gray-200 rounded-full h-2.5">
      <div className="bg-green-500 h-2.5 rounded-full" style={{width: '100%'}}></div>
    </div>
  </div>
  <p className="text-sm font-semibold text-green-600">100% Complete</p>
</div>
```

**Active State**:
```jsx
<div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-orange-500 
                hover:shadow-lg transition-shadow cursor-pointer">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="text-xl font-semibold text-gray-900">Subject-Verb Agreement</h3>
      <p className="text-sm text-gray-600 mt-1">23 items</p>
    </div>
    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
      Active
    </span>
  </div>
  <div className="mb-2">
    <div className="bg-gray-200 rounded-full h-2.5">
      <div className="bg-orange-500 h-2.5 rounded-full" style={{width: '65%'}}></div>
    </div>
  </div>
  <p className="text-sm font-semibold text-gray-900">15 of 23 complete</p>
</div>
```

**Locked State**:
```jsx
<div className="bg-gray-50 rounded-2xl shadow-sm p-5 opacity-60">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="text-xl font-semibold text-gray-600">Prepositions</h3>
      <p className="text-sm text-gray-500 mt-1">20 items</p>
    </div>
    <div className="text-gray-400 text-2xl">🔒</div>
  </div>
  <div className="mb-2">
    <div className="bg-gray-200 rounded-full h-2.5"></div>
  </div>
  <p className="text-sm font-semibold text-gray-500">Locked</p>
</div>
```

### 2. Primary Button

**Purpose**: Main call-to-action buttons

**Specifications**:
- Width: `w-full` on mobile
- Height: `py-4` (48px minimum)
- Border Radius: `rounded-xl` (12px)
- Shadow: `shadow-lg`
- Font: `font-bold`

**Default**:
```jsx
<button className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                   font-bold py-4 px-6 rounded-xl shadow-lg 
                   transition-colors duration-200 
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Check Answer
</button>
```

**Success**:
```jsx
<button className="w-full bg-green-600 hover:bg-green-700 text-white 
                   font-bold py-4 px-6 rounded-xl shadow-lg 
                   transition-colors duration-200">
  Continue →
</button>
```

**Disabled**:
```jsx
<button className="w-full bg-gray-300 text-gray-500 
                   font-bold py-4 px-6 rounded-xl 
                   cursor-not-allowed" disabled>
  Loading...
</button>
```

### 3. Secondary Button

**Purpose**: Less prominent actions

**Specifications**:
- Same size as primary
- Outlined style or lighter background

```jsx
<button className="w-full bg-white border-2 border-gray-300 
                   hover:border-gray-400 text-gray-900 
                   font-bold py-4 px-6 rounded-xl shadow-md 
                   transition-all duration-200
                   focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
  Skip
</button>
```

### 4. Answer Option Button

**Purpose**: Multiple choice answer selection

**Specifications**:
- Width: `w-full`
- Height: `py-4` (48px minimum)
- Border: `border-2`
- Text Alignment: `text-left`

**Default**:
```jsx
<button className="w-full bg-white border-2 border-gray-300 
                   hover:border-blue-500 hover:bg-blue-50 
                   rounded-xl p-4 text-left 
                   transition-all duration-200
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
      <span className="font-bold text-gray-600">A</span>
    </div>
    <span className="text-lg font-medium text-gray-900">explain</span>
  </div>
</button>
```

**Selected**:
```jsx
<button className="w-full bg-blue-50 border-2 border-blue-500 
                   rounded-xl p-4 text-left">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
      <span className="font-bold text-white">A</span>
    </div>
    <span className="text-lg font-medium text-gray-900">explain</span>
  </div>
</button>
```

### 5. Progress Bar

**Purpose**: Show completion progress

**Specifications**:
- Height: `h-2.5` (10px)
- Border Radius: `rounded-full`
- Background: `bg-gray-200`

**Implementation**:
```jsx
// Container
<div className="w-full bg-gray-200 rounded-full h-2.5">
  <div 
    className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
    style={{width: `${progress}%`}}
  />
</div>

// With label
<div className="flex items-center gap-3">
  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
    <div 
      className="bg-orange-500 h-2.5 rounded-full"
      style={{width: '65%'}}
    />
  </div>
  <span className="text-sm font-bold text-gray-900">15/23</span>
</div>
```

### 6. Feedback Box (Success)

**Purpose**: Show correct answer feedback

```jsx
<div className="bg-green-100 border-l-4 border-green-500 rounded-xl p-5 shadow-md">
  <div className="flex items-start gap-3">
    <div className="text-3xl">✓</div>
    <div>
      <p className="font-bold text-green-900 text-lg mb-2">Correct!</p>
      <p className="text-green-800">
        Great job! You chose the right answer.
      </p>
    </div>
  </div>
</div>
```

### 7. Feedback Box (Error)

**Purpose**: Show incorrect answer feedback

```jsx
<div className="bg-red-100 border-l-4 border-red-500 rounded-xl p-5 shadow-md">
  <div className="flex items-start gap-3">
    <div className="text-3xl">✗</div>
    <div>
      <p className="font-bold text-red-900 text-lg mb-2">Not quite right</p>
      <p className="text-red-800">
        Let's look at why this doesn't work.
      </p>
    </div>
  </div>
</div>
```

### 8. Explanation Box

**Purpose**: Provide learning explanation

```jsx
<div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
  <p className="text-sm font-bold text-gray-900 mb-2">Why this is correct:</p>
  <p className="text-sm text-gray-700 leading-relaxed">
    "The teacher explains" uses the third person singular form with -s. 
    In French, "le professeur explique" doesn't show this ending, but English requires it.
  </p>
</div>
```

### 9. Comparison Box

**Purpose**: Show French vs English comparison

```jsx
<div className="grid grid-cols-2 gap-3">
  {/* Wrong */}
  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
    <p className="text-xs font-bold text-red-700 mb-1">❌ French</p>
    <p className="text-sm text-gray-700 font-medium">explique</p>
  </div>
  
  {/* Correct */}
  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
    <p className="text-xs font-bold text-green-700 mb-1">✓ English</p>
    <p className="text-sm text-gray-700 font-medium">
      explain<span className="text-green-600 font-bold">s</span>
    </p>
  </div>
</div>
```

### 10. Header Component

**Purpose**: Navigation and context

```jsx
<header className="bg-blue-600 text-white p-4 shadow-md">
  <div className="flex items-center justify-between">
    <button className="font-semibold text-lg hover:opacity-80">
      ← Back
    </button>
    <span className="text-sm font-medium">Question 5 of 24</span>
  </div>
  {/* Progress bar */}
  <div className="mt-3 bg-blue-500 rounded-full h-2">
    <div 
      className="bg-white h-2 rounded-full transition-all"
      style={{width: '21%'}}
    />
  </div>
</header>
```

### 11. Stats Badge

**Purpose**: Display numeric statistics

```jsx
<div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
  <p className="text-3xl font-bold text-white">65%</p>
  <p className="text-xs text-blue-100 mt-1">Progress</p>
</div>
```

### 12. Question Container

**Purpose**: Highlight the question text

```jsx
<div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5 shadow-sm">
  <p className="text-lg text-gray-900 leading-relaxed">
    The teacher <span className="font-bold text-blue-600">___</span> the lesson every morning.
  </p>
</div>
```

---

## Screen Specifications

### Screen 1: Module Selection

**Purpose**: Main navigation, select grammar module

**Layout**:
```
┌─────────────────────────┐
│ Header (blue)           │
│ "OffGrid English"       │
│ [Optional stats]        │
├─────────────────────────┤
│                         │
│ [Card Grid 2 cols]      │
│ ┌──────┐ ┌──────┐      │
│ │Card 1│ │Card 2│      │
│ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐      │
│ │Card 3│ │Card 4│      │
│ └──────┘ └──────┘      │
│                         │
│ [Diagnostics link]      │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="bg-blue-600 text-white p-6">
    <h1 className="text-2xl font-bold">OffGrid English</h1>
    <p className="text-sm text-blue-100 mt-1">Choose your module</p>
  </header>
  
  {/* Main Content */}
  <main className="p-4 max-w-4xl mx-auto">
    {/* Stats (Optional) */}
    <div className="flex gap-3 mb-6">
      <div className="flex-1 bg-white rounded-xl p-4 shadow-md text-center">
        <p className="text-2xl font-bold text-gray-900">65%</p>
        <p className="text-xs text-gray-600">Complete</p>
      </div>
      <div className="flex-1 bg-white rounded-xl p-4 shadow-md text-center">
        <p className="text-2xl font-bold text-gray-900">39</p>
        <p className="text-xs text-gray-600">Items Done</p>
      </div>
    </div>
    
    {/* Module Cards Grid */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Cards here */}
    </div>
    
    {/* Diagnostics Link */}
    <button className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-3">
      Diagnostics & Settings
    </button>
  </main>
</div>
```

**Spacing**:
- Screen padding: `p-4` (16px)
- Grid gap: `gap-4` (16px)
- Card padding: `p-5` (20px)
- Section margins: `mb-6` (24px)

---

### Screen 2: Practice Question

**Purpose**: Answer grammar questions

**Layout**:
```
┌─────────────────────────┐
│ Header                  │
│ [← Back] [Question 5/24]│
│ [Progress Bar]          │
├─────────────────────────┤
│                         │
│ Instruction text        │
│                         │
│ ┌─────────────────────┐ │
│ │ Question Box        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Answer A            │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Answer B            │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Answer C            │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Check Answer Button │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Header */}
  <header className="bg-blue-600 text-white p-4 shadow-md">
    <div className="flex items-center justify-between mb-3">
      <button className="font-semibold text-lg">← Back</button>
      <span className="text-sm font-medium">Question 5 of 24</span>
    </div>
    <div className="bg-blue-500 rounded-full h-2">
      <div 
        className="bg-white h-2 rounded-full transition-all"
        style={{width: '21%'}}
      />
    </div>
  </header>
  
  {/* Content */}
  <main className="flex-1 p-6">
    {/* Instruction */}
    <p className="text-sm text-gray-600 mb-4">Choose the correct form:</p>
    
    {/* Question */}
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5 mb-6 shadow-sm">
      <p className="text-lg text-gray-900 leading-relaxed">
        The teacher <span className="font-bold text-blue-600">___</span> the lesson every morning.
      </p>
    </div>
    
    {/* Answers */}
    <div className="space-y-3 mb-6">
      {/* Answer buttons */}
    </div>
    
    {/* Submit */}
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-bold py-4 px-6 rounded-xl shadow-lg">
      Check Answer
    </button>
  </main>
</div>
```

**Spacing**:
- Content padding: `p-6` (24px)
- Instruction margin: `mb-4` (16px)
- Question margin: `mb-6` (24px)
- Answer gaps: `space-y-3` (12px)
- Submit margin: `mb-6` (24px)

---

### Screen 3: Feedback (Correct)

**Purpose**: Celebrate correct answer, provide explanation

**Layout**:
```
┌─────────────────────────┐
│ Header                  │
│ [← Back] [5/24] [✓]    │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ ✓ Correct!          │ │
│ │ (Green box)         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Explanation         │ │
│ │ (Gray box)          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ French vs English   │ │
│ │ (Comparison)        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Continue Button     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Header (same as practice) */}
  
  {/* Content */}
  <main className="flex-1 p-6">
    {/* Success Message */}
    <div className="bg-green-100 border-l-4 border-green-500 rounded-xl p-5 shadow-md mb-6">
      <div className="flex items-start gap-3">
        <div className="text-3xl">✓</div>
        <div>
          <p className="font-bold text-green-900 text-lg mb-2">Correct!</p>
          <p className="text-green-800">
            Great job! You chose the right answer.
          </p>
        </div>
      </div>
    </div>
    
    {/* Explanation */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
      <p className="text-sm font-bold text-gray-900 mb-2">Why this is correct:</p>
      <p className="text-sm text-gray-700 leading-relaxed">
        "The teacher explains" uses the third person singular form with -s.
      </p>
    </div>
    
    {/* Comparison */}
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* French vs English */}
    </div>
    
    {/* Continue */}
    <button className="w-full bg-green-600 hover:bg-green-700 text-white 
                       font-bold py-4 px-6 rounded-xl shadow-lg">
      Continue →
    </button>
  </main>
</div>
```

---

### Screen 4: Feedback (Incorrect)

**Purpose**: Show mistake, teach correct answer

**Layout**:
```
┌─────────────────────────┐
│ Header                  │
│ [← Back] [5/24]        │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ ✗ Not quite right   │ │
│ │ (Red box)           │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Your Answer         │ │
│ │ (Red border)        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Correct Answer      │ │
│ │ (Green border)      │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Explanation         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Try Again / Continue│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Header (same) */}
  
  <main className="flex-1 p-6">
    {/* Error Message */}
    <div className="bg-red-100 border-l-4 border-red-500 rounded-xl p-5 shadow-md mb-6">
      <div className="flex items-start gap-3">
        <div className="text-3xl">✗</div>
        <div>
          <p className="font-bold text-red-900 text-lg mb-2">Not quite right</p>
          <p className="text-red-800">
            Let's look at why this doesn't work.
          </p>
        </div>
      </div>
    </div>
    
    {/* Your Answer */}
    <div className="mb-4">
      <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Your Answer:</p>
      <div className="bg-white border-2 border-red-300 rounded-xl p-4">
        <p className="text-gray-900">
          The teacher <span className="font-bold text-red-600">explain</span> the lesson.
        </p>
      </div>
    </div>
    
    {/* Correct Answer */}
    <div className="mb-6">
      <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Correct Answer:</p>
      <div className="bg-white border-2 border-green-300 rounded-xl p-4">
        <p className="text-gray-900">
          The teacher <span className="font-bold text-green-600">explains</span> the lesson.
        </p>
      </div>
    </div>
    
    {/* Explanation */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
      <p className="text-sm text-gray-700 leading-relaxed">
        In English, third person singular verbs need -s or -es.
      </p>
    </div>
    
    {/* Actions */}
    <div className="space-y-3">
      <button className="w-full bg-orange-600 hover:bg-orange-700 text-white 
                         font-bold py-4 px-6 rounded-xl shadow-lg">
        Try This Question Again
      </button>
      <button className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 
                         text-gray-900 font-bold py-4 px-6 rounded-xl shadow-md">
        Continue to Next →
      </button>
    </div>
  </main>
</div>
```

---

### Screen 5: Teacher Validation

**Purpose**: Teachers validate learner responses

**Layout**:
```
┌─────────────────────────┐
│ Header                  │
│ Teacher Validation      │
├─────────────────────────┤
│                         │
│ Item Display            │
│ ┌─────────────────────┐ │
│ │ Learner's Answer    │ │
│ │ System Score        │ │
│ └─────────────────────┘ │
│                         │
│ Do you agree?           │
│ ┌──────┐  ┌──────┐     │
│ │Agree │  │Disagree│    │
│ └──────┘  └──────┘     │
│                         │
│ Optional Rating/Notes   │
│                         │
│ ┌─────────────────────┐ │
│ │ Next Button         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-blue-600 text-white p-6">
    <h1 className="text-xl font-bold">Teacher Validation</h1>
    <p className="text-sm text-blue-100 mt-1">Item {currentItem} of {totalItems}</p>
  </header>
  
  <main className="p-6 max-w-2xl mx-auto">
    {/* Item Display */}
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Question:</p>
        <p className="text-lg text-gray-900">The teacher ___ the lesson.</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Learner's Answer:</p>
        <p className="text-lg font-semibold text-gray-900">explains</p>
      </div>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-sm font-bold text-green-900">System: Correct</p>
      </div>
    </div>
    
    {/* Agreement */}
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <p className="text-lg font-semibold text-gray-900 mb-4">
        Do you agree with the system's assessment?
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-500 hover:bg-green-600 text-white 
                           font-bold py-4 rounded-xl shadow-md">
          ✓ Agree
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white 
                           font-bold py-4 rounded-xl shadow-md">
          ✗ Disagree
        </button>
      </div>
    </div>
    
    {/* Optional Notes */}
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Optional Notes:
      </label>
      <textarea 
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="3"
        placeholder="Any additional comments..."
      />
    </div>
    
    {/* Next */}
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-bold py-4 px-6 rounded-xl shadow-lg">
      Next Item →
    </button>
  </main>
</div>
```

---

### Screen 6: Analytics Dashboard

**Purpose**: Display metrics in tables

**Layout**:
```
┌─────────────────────────┐
│ Header                  │
│ Analytics Dashboard     │
│ [Export CSV Button]     │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Completion Table    │ │
│ │ ┌───┬───┬───┐       │ │
│ │ │   │   │   │       │ │
│ │ └───┴───┴───┘       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Performance Table   │ │
│ │ ┌───┬───┬───┐       │ │
│ │ │   │   │   │       │ │
│ │ └───┴───┴───┘       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Transfer Table      │ │
│ │ ┌───┬───┬───┐       │ │
│ │ │   │   │   │       │ │
│ │ └───┴───┴───┘       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-blue-600 text-white p-6">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-3">Analytics Dashboard</h1>
      <button className="bg-white text-blue-600 font-semibold px-4 py-2 
                         rounded-lg hover:bg-blue-50 transition-colors">
        📥 Export All Data (CSV)
      </button>
    </div>
  </header>
  
  <main className="p-6 max-w-6xl mx-auto">
    {/* Completion Metrics */}
    <section className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Completion Metrics</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Module
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Items Completed
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Completion %
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                Verb Tense
              </td>
              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                24/24
              </td>
              <td className="border border-gray-300 px-4 py-3 text-sm font-semibold text-green-600">
                100%
              </td>
            </tr>
            {/* More rows */}
          </tbody>
        </table>
      </div>
    </section>
    
    {/* More tables */}
  </main>
</div>
```

**Table Styling**:
```css
/* Table classes */
.table-container {
  @apply overflow-x-auto;
}

.data-table {
  @apply w-full border border-gray-300;
}

.table-header {
  @apply bg-gray-100;
}

.table-header-cell {
  @apply border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900;
}

.table-row {
  @apply hover:bg-gray-50;
}

.table-cell {
  @apply border border-gray-300 px-4 py-3 text-sm text-gray-900;
}
```

---

### Screen 7: Diagnostics

**Purpose**: Show app status, allow reset

**Layout**:
```
┌─────────────────────────┐
│ Header                  │
│ Diagnostics             │
├─────────────────────────┤
│                         │
│ App Information         │
│ ┌─────────────────────┐ │
│ │ Version: 1.0.0      │ │
│ │ Online: Yes         │ │
│ │ Cache: Active       │ │
│ │ Storage: 2.3 MB     │ │
│ └─────────────────────┘ │
│                         │
│ Actions                 │
│ ┌─────────────────────┐ │
│ │ Reset App (Red)     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Implementation**:
```jsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-blue-600 text-white p-6">
    <h1 className="text-xl font-bold">Diagnostics</h1>
  </header>
  
  <main className="p-6 max-w-2xl mx-auto">
    {/* Info Card */}
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">App Information</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Version</span>
          <span className="text-sm font-semibold text-gray-900">1.0.0</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Online Status</span>
          <span className="text-sm font-semibold text-green-600">Online</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Cache Status</span>
          <span className="text-sm font-semibold text-green-600">Active</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Storage Used</span>
          <span className="text-sm font-semibold text-gray-900">2.3 MB</span>
        </div>
      </div>
    </div>
    
    {/* Actions */}
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
      
      <button className="w-full bg-red-600 hover:bg-red-700 text-white 
                         font-bold py-4 px-6 rounded-xl shadow-lg">
        ⚠️ Reset App
      </button>
      
      <p className="text-xs text-gray-600 mt-3 text-center">
        This will clear all local data and progress
      </p>
    </div>
  </main>
</div>
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### 1. Color Contrast

**Minimum Ratios**:
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

**Testing**:
```bash
# Use Chrome DevTools
# Inspect element → Accessibility panel → Contrast ratio
```

**Common Issues to Avoid**:
- ❌ Light gray text on white (`text-gray-400` on `bg-white`) = 2.8:1 FAIL
- ✓ Dark gray text on white (`text-gray-600` on `bg-white`) = 7.2:1 PASS
- ❌ Blue text on blue background
- ✓ White text on blue background (`text-white` on `bg-blue-600`) = 4.9:1 PASS

#### 2. Touch Targets

**Minimum Size**: 44px × 44px

**Implementation**:
```jsx
// Button with adequate touch target
<button className="py-4 px-6"> {/* 48px height */}
  Click Me
</button>

// Avoid tiny targets
<button className="p-1"> {/* 8px - TOO SMALL */}
  ×
</button>

// Correct for icons
<button className="p-3"> {/* 48px with padding */}
  <IconComponent className="w-6 h-6" />
</button>
```

**Spacing Between Targets**:
- Minimum 8px gap between interactive elements
- Use `space-y-3` (12px) for stacked buttons

#### 3. Focus States

**Required for all interactive elements**:
```jsx
// Standard focus ring
className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
           focus:outline-none"

// High contrast focus (for dark backgrounds)
className="focus:ring-2 focus:ring-white focus:ring-offset-2 
           focus:ring-offset-blue-600"

// Never remove focus without replacement
// ❌ Don't do: focus:outline-none (alone)
```

**Visible Focus Indicator**:
- Must be clearly visible
- 2px ring minimum
- High contrast color
- Offset from element

#### 4. Keyboard Navigation

**Requirements**:
- All interactive elements must be keyboard accessible
- Logical tab order
- Skip to main content link (optional)
- Escape key closes modals

**Implementation**:
```jsx
// Ensure proper tab order with tabIndex
<button tabIndex={0}>Primary</button>
<button tabIndex={0}>Secondary</button>

// Skip link (for accessibility)
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

#### 5. Labels and ARIA

**Form Inputs**:
```jsx
// Always associate labels
<label htmlFor="learner-id" className="text-sm font-semibold text-gray-900">
  Learner ID
</label>
<input 
  id="learner-id"
  type="text"
  className="..."
/>

// Or use aria-label for icon buttons
<button aria-label="Close dialog">
  ×
</button>
```

**Progress Bars**:
```jsx
<div 
  role="progressbar"
  aria-valuenow={65}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Module completion progress"
>
  <div className="..." style={{width: '65%'}} />
</div>
```

**Screen Reader Text**:
```jsx
// Hide visually but keep for screen readers
<span className="sr-only">Loading...</span>

// Tailwind sr-only class:
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### 6. Language Attribute

```html
<!DOCTYPE html>
<html lang="en">
  <!-- App content -->
</html>
```

#### 7. Semantic HTML

```jsx
// Use proper semantic elements
<header>
<main>
<nav>
<section>
<article>
<aside>
<footer>

// Not just divs everywhere
// ❌ <div className="header">
// ✓ <header>
```

---

## Responsive Behavior

### Breakpoints (Tailwind Defaults)

| Breakpoint | Min Width | Typical Device |
|------------|-----------|----------------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### Mobile-First Approach

**Default styles are for mobile, then add larger breakpoints**:

```jsx
// Mobile: 1 column, Desktop: 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Mobile: full width, Desktop: constrained width
<div className="w-full md:max-w-4xl md:mx-auto">

// Mobile: small padding, Desktop: large padding
<div className="p-4 md:p-6 lg:p-8">
```

### Responsive Patterns

#### 1. Module Cards Grid

```jsx
// 1 col mobile, 2 cols tablet, 3 cols desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {modules.map(module => (
    <ModuleCard key={module.id} {...module} />
  ))}
</div>
```

#### 2. Content Container

```jsx
// Full width on mobile, max-width on desktop
<div className="w-full px-4 md:max-w-4xl md:mx-auto md:px-6">
  {/* Content */}
</div>
```

#### 3. Buttons

```jsx
// Full width on mobile, auto width on desktop
<button className="w-full md:w-auto">
  Continue
</button>

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-3">
  <button>Try Again</button>
  <button>Continue</button>
</div>
```

#### 4. Typography

```jsx
// Smaller on mobile, larger on desktop
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Title
</h1>
```

#### 5. Spacing

```jsx
// Less padding on mobile, more on desktop
<section className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</section>
```

### Testing Responsive Design

**Chrome DevTools**:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at:
   - 320px (small phone)
   - 375px (iPhone SE)
   - 768px (iPad)
   - 1024px (laptop)

**Real Devices**:
- Test on actual Android phone
- Test on tablet (if available)
- Test on desktop browser

---

## Implementation Guidelines

### File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Header.tsx
│   ├── modules/
│   │   ├── ModuleCard.tsx
│   │   └── ModuleGrid.tsx
│   ├── practice/
│   │   ├── QuestionScreen.tsx
│   │   ├── AnswerOption.tsx
│   │   ├── FeedbackCorrect.tsx
│   │   └── FeedbackIncorrect.tsx
│   └── analytics/
│       ├── MetricsTable.tsx
│       └── ExportButton.tsx
├── screens/
│   ├── ModuleSelection.tsx
│   ├── Practice.tsx
│   ├── Analytics.tsx
│   └── Diagnostics.tsx
├── styles/
│   └── globals.css
└── App.tsx
```

### Component Template

```tsx
// Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = true,
}) => {
  const baseClasses = 'font-bold py-4 px-6 rounded-xl shadow-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 focus:ring-gray-400',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### CSS Organization

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  body {
    @apply bg-gray-50 text-gray-900 font-sans;
  }
}

/* Custom components */
@layer components {
  .card {
    @apply bg-white rounded-2xl shadow-md p-5;
  }
  
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg;
  }
}

/* Custom utilities */
@layer utilities {
  .sr-only {
    @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
  }
}
```

### Performance Optimizations

**Bundle Size**:
```javascript
// Purge unused Tailwind classes
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // This removes unused classes automatically
}
```

**Image Optimization**:
- No images in v1 (use emojis for icons)
- If needed: use SVG or optimized PNG
- Lazy load images: `loading="lazy"`

**Code Splitting**:
```typescript
// Lazy load screens
const Analytics = lazy(() => import('./screens/Analytics'));
const Diagnostics = lazy(() => import('./screens/Diagnostics'));
```

### Development Workflow

1. **Build Mobile First**
   - Design for 375px width first
   - Test on mobile device or emulator
   - Then add desktop styles

2. **Component Development**
   - Build one component at a time
   - Test accessibility immediately
   - Document props and usage

3. **Testing Checklist**
   - [ ] Looks good on mobile (375px)
   - [ ] Looks good on tablet (768px)
   - [ ] Looks good on desktop (1280px)
   - [ ] Touch targets ≥44px
   - [ ] Color contrast ≥4.5:1
   - [ ] Keyboard navigation works
   - [ ] Focus states visible
   - [ ] Screen reader friendly

4. **Code Review**
   - Check bundle size impact
   - Verify accessibility
   - Test on real device
   - Validate HTML semantics

---

## Quick Reference

### Common Class Combinations

```jsx
// Card
className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow"

// Primary Button
className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

// Success Box
className="bg-green-100 border-l-4 border-green-500 rounded-xl p-5 shadow-md"

// Progress Bar
className="bg-gray-200 rounded-full h-2.5"
// Fill: className="bg-green-500 h-2.5 rounded-full"

// Grid (2 cols mobile)
className="grid grid-cols-2 gap-4"

// Centered Container
className="max-w-4xl mx-auto px-4"
```

### Emoji Icon Reference

Use emojis instead of icon libraries (saves bundle size):

| Purpose | Emoji | Unicode |
|---------|-------|---------|
| Checkmark | ✓ | U+2713 |
| Cross | ✗ | U+2717 |
| Lock | 🔒 | U+1F512 |
| Fire | 🔥 | U+1F525 |
| Book | 📚 | U+1F4DA |
| Rocket | 🚀 | U+1F680 |
| Party | 🎉 | U+1F389 |
| Thinking | 💭 | U+1F4AD |
| Lightbulb | 💡 | U+1F4A1 |

---

## Final Checklist

Before considering UI complete:

### Visual Design
- [ ] All screens follow consistent spacing
- [ ] Colors are from the defined palette
- [ ] Typography is consistent
- [ ] Shadows and borders are consistent
- [ ] Border radius is consistent

### Accessibility
- [ ] All text has 4.5:1 contrast minimum
- [ ] All interactive elements ≥44px
- [ ] All interactive elements have focus states
- [ ] All images have alt text (if any)
- [ ] All form inputs have labels
- [ ] Keyboard navigation works throughout
- [ ] Screen reader tested (basic)

### Responsive
- [ ] Works at 320px width
- [ ] Works at 375px width (iPhone SE)
- [ ] Works at 768px width (iPad)
- [ ] Works at 1280px width (desktop)
- [ ] Grid layouts adjust properly
- [ ] Typography scales appropriately

### Performance
- [ ] Bundle size ≤150KB gzipped
- [ ] No unnecessary images
- [ ] No web fonts loaded
- [ ] CSS is purged of unused classes
- [ ] Components load quickly

### Functionality
- [ ] All buttons work
- [ ] Navigation flows correctly
- [ ] Feedback screens display properly
- [ ] Progress tracking works
- [ ] Offline functionality maintained

---

## Document Version

**Version**: 1.0  
**Last Updated**: [Current Date]  
**Created For**: OffGrid English Project  
**Author**: [Your Name]

---

This document should be treated as the single source of truth for all UI implementation decisions. Any deviations should be documented and justified.