# 📋 REVISED PROJECT PLAN: WEEKS 11-16
## OffGrid English - Enhanced Implementation Plan

---

## EXECUTIVE SUMMARY

**Total Features**: 21 (11 from your suggestions + 10 from recommendations)
**Timeline**: 6 weeks (Weeks 11-16)
**Cost**: $0 (all free, open-source tools)
**Offline-First**: ✅ Maintained throughout
**Research-Grounded**: ✅ All features map to Assignments 1-3 + Qualifier Question

---

## FEATURE INVENTORY (21 TOTAL)

### ⭐ Tier 1: CORE Features (10) - Highest Priority

| # | Feature | Research Source | Week |
|---|---------|-----------------|------|
| 1 | Contrastive Analysis View | A1: #5,#8; A3: Sokeng 2014 | 12 |
| 2 | Personalized Learning Path | A2: SLA; A3: #24; QQ | 12 |
| 3 | Spaced Repetition System | A2: Krashen; A3: persistence | 12 |
| 5 | Real-World Cameroonian Scenarios | A1: #2; A3: authentic tasks | 11 |
| 7 | Enhanced Teacher Validation | QQ: sampling; Proposal | 11 |
| 9 | False Cognates Highlighter | A1: #8; A2: transfer | 15 |
| 10 | Teacher Q&A Queue | A1: #7 (WhatsApp COVID) | 15 |
| 12 | Voice Input for Answers | A1: #9,#10,#13; A3: #7 | 13 |
| 19 | Enhanced Analytics Dashboard (charts) | A3: #17; QQ: metrics | 11 |
| - | CSV Exports (all data) | QQ: open standards | 11 |

### ✓ Tier 2: STRONG Features (5) - High Priority

| # | Feature | Research Source | Week |
|---|---------|-----------------|------|
| 6 | Interactive Error Explanations | A2: explicit; A3: #15,#16 | 11 |
| 8 | Achievement System | A1: #18; A3: #12 | 12 |
| 11 | Enhanced Progress Tracking | A3: persist; QQ: metrics | 12 |
| 21 | Bookmarking | A3: #14,#24 | 12 |

### ○ Tier 3: SUPPORTED Features (6) - Medium Priority

| # | Feature | Research Source | Week |
|---|---------|-----------------|------|
| 4 | Weekly Progress Report (PNG/PDF) | A3: metrics; QQ: equity | 13 |
| 13 | Dark Mode | A2: UNESCO; accessibility | 11 |
| 14 | Micro-interactions & Animations | A3: #17 (cognitive load) | 11-13 |
| 15 | Mobile-First Optimizations | A1: #11,#12,#13 (MALL) | 13 |
| 16 | PWA Excellence | A3: #19; Proposal | 13 |
| 17 | Professional Onboarding | A2: #13; A3: #10 | 13 |
| 18 | Challenge Mode | A1: #18; A3: #12 | 12 |
| 20 | Certificate Generator | A3: #24 (motivation) | 16 |

---

## WEEK-BY-WEEK BREAKDOWN

### WEEK 11: Enhanced UI/UX + Analytics Foundation (Nov 4-10)
**Theme**: Transform from functional to professional + Data visualization

**Goals**:
- Complete teacher validation interface enhancement
- Build visual analytics dashboard with charts
- Add dark mode
- Integrate Cameroonian scenarios
- Setup animation framework

**Tasks**:

| Task | Hours | Definition of Done |
|------|-------|-------------------|
| **Install Dependencies** | 1 | `npm install framer-motion recharts` succeeds; TypeScript types work |
| **Enhanced Analytics Dashboard** | 8 | - 5 metric categories render as tables<br/>- Recharts installed and working<br/>- 3 charts: completion bar, accuracy line, transfer comparison<br/>- All charts responsive on mobile<br/>- CSV export includes APP_VERSION |
| **Enhanced Teacher Validation** | 4 | - Keyboard shortcuts (A=agree, D=disagree, ←/→ navigate)<br/>- Split-screen view (student vs correct answer)<br/>- Sample counter shows progress (X of 20)<br/>- Agreement rate updates in real-time<br/>- validation.csv exports correctly |
| **Dark Mode** | 3 | - System preference detection (`prefers-color-scheme`)<br/>- Manual toggle in settings<br/>- Preference saved to localStorage<br/>- All colors have dark variants<br/>- WCAG 4.5:1 contrast maintained |
| **Real-World Cameroonian Scenarios** | 5 | - Add `scenario` field to item schema<br/>- 3-5 scenarios implemented (market, moto-taxi, school, job interview)<br/>- Each scenario has 4-6 items<br/>- Simple icon/emoji per scenario<br/>- Contextual feedback references scenario |
| **Interactive Error Explanations (setup)** | 3 | - Framer Motion basic animations working<br/>- Step-by-step feedback component created<br/>- Test with 2-3 sample explanations<br/>- Animations smooth on low-end devices |
| **Micro-interactions Foundation** | 2 | - Button ripple effects on tap<br/>- Success animations (checkmark fade-in)<br/>- Loading skeleton screens<br/>- Smooth page transitions |
| **Code Review & Testing** | 2 | - All TypeScript strict mode passes<br/>- ESLint clean<br/>- Manual testing on Android emulator<br/>- Lighthouse accessibility ≥90 |

**Total**: 28 hours
**Deliverable**: Polished dashboard with visual analytics, enhanced teacher tools, dark mode working

---

### WEEK 12: Smart Learning Features (Nov 11-17)
**Theme**: Intelligence layer - Adaptive learning + Spaced repetition

**Goals**:
- Implement personalized learning path algorithm
- Add spaced repetition system
- Build achievement system
- Enhanced progress tracking
- Bookmarking feature

**Tasks**:

| Task | Hours | Definition of Done |
|------|-------|-------------------|
| **Contrastive Analysis View** | 6 | - Toggle button on each question: "💡 French Comparison"<br/>- Shows side-by-side French/English structures<br/>- Visual highlighting (red=interference, green=correct)<br/>- Explains "Why French speakers struggle"<br/>- Data stored in item schema `frenchComparison` field<br/>- Add to 20-30 high-frequency error items |
| **Personalized Learning Path** | 8 | - Algorithm scores weak areas (by module accuracy)<br/>- "Smart Practice" mode button<br/>- Selects 10 questions from weakest 2 categories<br/>- Visual skill tree shows mastery % per module<br/>- Algorithm uses IndexedDB queries (no external API)<br/>- Works offline |
| **Spaced Repetition System** | 6 | - Track `lastAttempted` timestamp per item<br/>- Track `difficultyScore` (0-1, based on attempts)<br/>- "Review Mode" surfaces items: wrong + not seen in 3+ days<br/>- SM-2 algorithm (simplified): intervals 1d, 3d, 7d, 14d<br/>- Visual indicator: "Due for review" badge<br/>- Stores in IndexedDB |
| **Achievement System** | 5 | - 5 achievement types:<br/>  1. First Module Complete<br/>  2. Perfect Score (10/10)<br/>  3. 5-Day Streak<br/>  4. 100 Questions Answered<br/>  5. All Modules Complete<br/>- Toast notification on unlock<br/>- Achievements page lists all (locked/unlocked)<br/>- Stored in localStorage (offline) |
| **Enhanced Progress Tracking** | 4 | - Visual progress rings (circular, animated)<br/>- Module completion badges<br/>- Unlock system: Form B locked until Form A ≥70%<br/>- Overall progress dashboard<br/>- Works offline with IndexedDB |
| **Bookmarking** | 3 | - "🔖 Bookmark" button on question screen<br/>- "My Bookmarks" page lists all saved items<br/>- Shows module, question text, difficulty<br/>- Remove bookmark option<br/>- Stored in IndexedDB |
| **Challenge Mode** | 4 | - "Speed Challenge": 10 questions, 2-min timer<br/>- "Accuracy Challenge": Get 10 correct in a row<br/>- "Streak Challenge": Practice 7 days straight<br/>- Results screen shows best scores<br/>- Leaderboard (local only, no sync) |
| **Testing & Polish** | 2 | - All features tested on emulator<br/>- TypeScript strict mode passes<br/>- Performance check (no lag on interactions) |

**Total**: 38 hours
**Deliverable**: Intelligent learning system with adaptive paths and spaced repetition

---

### WEEK 13: Mobile Excellence + Milestone 2 (Nov 18-24)
**Theme**: Perfect mobile experience + Second milestone

**Goals**:
- Mobile-first optimizations
- PWA excellence
- Voice input
- Weekly progress reports
- Professional onboarding
- Milestone 2 video

**Tasks**:

| Task | Hours | Definition of Done |
|------|-------|-------------------|
| **Mobile-First Optimizations** | 5 | - Touch targets ≥48px (WCAG compliant)<br/>- Swipe gestures: left/right for next/prev question<br/>- Bottom navigation for thumb zone<br/>- Pull-to-refresh on lists<br/>- Test on 3 different screen sizes |
| **PWA Excellence** | 4 | - Custom splash screen (1080x1920, logo + branding)<br/>- App icons: 192x192, 512x512, maskable<br/>- Native feel: no browser chrome, status bar color<br/>- Install prompt on first visit<br/>- Smooth animations (60fps)<br/>- Tests: PWABuilder passes all checks |
| **Voice Input for Answers** | 6 | - Web Speech API integration (`webkitSpeechRecognition`)<br/>- Microphone permission request<br/>- "🎤 Speak Answer" button (optional)<br/>- Fallback: Click to type if denied/unsupported<br/>- Visual feedback (listening animation)<br/>- Validates spoken answer against correct answer<br/>- Logs pronunciation attempts (for teacher review)<br/>- Graceful degradation on unsupported browsers |
| **Weekly Progress Report** | 5 | - HTML Canvas generates PNG summary<br/>- Shows: streak, modules completed, accuracy trend, top achievement<br/>- Cameroonian color accents (green/yellow/red)<br/>- "Share" button uses Web Share API<br/>- Fallback: Download PNG if share unsupported<br/>- "Export PDF" option (browser print to PDF)<br/>- Triggered automatically every 7 days |
| **Professional Onboarding** | 4 | - 4-screen welcome flow on first launch:<br/>  1. Welcome + app purpose<br/>  2. How it works (3-phase learning)<br/>  3. Offline demo (show airplane mode icon)<br/>  4. Choose your first module<br/>- Swipeable cards (react-swipeable)<br/>- "Skip" option<br/>- Sets `onboardingCompleted` flag in localStorage |
| **Performance Optimization** | 3 | - Lazy load routes: `React.lazy()` for Analytics, Validation<br/>- Image optimization: Use WebP with PNG fallback<br/>- Virtual scrolling for long module lists<br/>- Bundle analysis: Keep <250KB gzipped<br/>- Code splitting by route |
| **Milestone 2 Video Preparation** | 5 | - Record 5-min demo video:<br/>  1. Show all 7 modules<br/>  2. Demonstrate 5 new features (contrastive analysis, spaced repetition, voice input, analytics charts, achievements)<br/>  3. Show offline functionality proof<br/>  4. CSV export demonstration<br/>  5. Mobile responsiveness<br/>- Edit with screen recording + voiceover<br/>- Upload to required platform |

**Total**: 32 hours
**Deliverable**: App-like mobile experience + Milestone 2 submission

---

### WEEK 14: Testing & Quality Assurance (Nov 25-Dec 1)
**Theme**: Ensure quality, reliability, and accessibility

**Goals**:
- Comprehensive test suite
- Real device testing
- Bug fixes
- Accessibility audit

**Tasks**:

| Task | Hours | Definition of Done |
|------|-------|-------------------|
| **Playwright E2E Test Suite** | 6 | - Test critical flows:<br/>  1. Module selection → practice → feedback<br/>  2. Offline mode: complete item, check IndexedDB<br/>  3. Teacher validation: sample review, CSV export<br/>  4. Analytics: view metrics, export CSV<br/>  5. Voice input: permission handling<br/>- Automated zero-byte test passes<br/>- CI integration (runs on push)<br/>- Screenshots on failure |
| **Lighthouse CI** | 2 | - Performance ≥90<br/>- Accessibility ≥90<br/>- Best Practices ≥90<br/>- PWA ≥90<br/>- SEO ≥80<br/>- CI integration |
| **Accessibility Audit (axe-core)** | 3 | - Install @axe-core/react<br/>- Run automated scan<br/>- Fix critical issues:<br/>  - Missing ARIA labels<br/>  - Contrast violations<br/>  - Focus indicators<br/>  - Keyboard navigation<br/>- Manual screen reader test (VoiceOver/TalkBack) |
| **Real Device Testing** | 4 | - Test on 3 physical devices:<br/>  1. Android (mid-range, Chrome)<br/>  2. Android (low-end, < 2GB RAM)<br/>  3. iOS (Safari)<br/>- Test scenarios:<br/>  - Offline mode works<br/>  - Voice input works (or fails gracefully)<br/>  - Swipe gestures smooth<br/>  - Animations not janky<br/>  - Storage quota doesn't exceed<br/>- Document device compatibility |
| **Visual Regression Testing** | 2 | - Install `playwright-test` with screenshots<br/>- Baseline screenshots for:<br/>  - Home page<br/>  - Module learning page<br/>  - Practice page<br/>  - Analytics dashboard<br/>  - Dark mode variants<br/>- Compare against baseline on changes |
| **Bug Fixes** | 6 | - Fix all P0/P1 bugs from testing<br/>- Address accessibility violations<br/>- Handle edge cases:<br/>  - Storage quota exceeded<br/>  - Network interruption mid-sync<br/>  - Multiple tabs open<br/>  - Resume from where left off<br/>- Data integrity checks |
| **Performance Testing** | 2 | - Test on slow 3G network (Chrome DevTools)<br/>- Ensure offline mode works with 0 network<br/>- Check bundle size: ≤250KB gzipped<br/>- Test with 1000+ attempts in IndexedDB<br/>- Memory leak check (Chrome DevTools) |
| **Code Quality Review** | 3 | - ESLint: 0 warnings<br/>- TypeScript: strict mode, no `any`<br/>- Code coverage ≥70% (critical paths)<br/>- Remove console.logs (production build)<br/>- Add JSDoc comments to complex functions |

**Total**: 28 hours
**Deliverable**: Comprehensive test suite, bug-free experience, accessibility compliant

---

### WEEK 15: Evaluation & Advanced Features (Dec 2-8)
**Theme**: User testing, expert review, final features

**Goals**:
- User testing with 3-5 students
- Expert review with ESL educators
- False cognates feature
- Teacher Q&A queue
- Advanced analytics

**Tasks**:

| Task | Hours | Definition of Done |
|------|-------|-------------------|
| **False Cognates Highlighter** | 4 | - Create false cognates database (20-30 pairs):<br/>  - "assist" ≠ "assister"<br/>  - "actually" ≠ "actuellement"<br/>  - "attend" ≠ "attendre"<br/>- ⚠️ Warning badge appears on relevant questions<br/>- Tooltip explains difference<br/>- Add to item schema: `falseCognate: {en, fr, explanation}`<br/>- Works offline |
| **Teacher Q&A Queue** | 6 | - Student can ask question from practice screen<br/>- Question saved to IndexedDB: `{learnerId, itemId, question, timestamp}`<br/>- Teacher dashboard shows question queue<br/>- Teacher types answer, saves to IndexedDB<br/>- Next time student syncs, sees answer<br/>- UI: "❓ Ask Teacher" button<br/>- Works fully offline (store-and-forward) |
| **User Testing Preparation** | 3 | - Recruit 3-5 students (ideally Cameroonian or Francophone)<br/>- Prepare consent form (minimal risk, anonymous)<br/>- Prepare testing protocol:<br/>  1. Complete 1-2 modules<br/>  2. Try 3-5 new features<br/>  3. 10-min survey (SUS scale)<br/>  4. Optional 5-min interview<br/>- Setup screen recording (with permission) |
| **User Testing Execution** | 6 | - Conduct 3-5 sessions (remote or in-person)<br/>- Observe interactions, note issues<br/>- Collect survey responses<br/>- Record qualitative feedback<br/>- Document usability problems |
| **Expert Review Coordination** | 4 | - Send survey to 3-5 ESL educators<br/>- Survey questions:<br/>  1. Clarity of contrastive analysis (1-5 scale)<br/>  2. Cultural appropriateness of scenarios (1-5)<br/>  3. Usefulness of feedback (1-5)<br/>  4. Suitability for shared devices (1-5)<br/>  5. Likelihood to use in classroom (1-5)<br/>  6. Open feedback (text)<br/>- Follow up with 1-2 for brief interview<br/>- Collect responses |
| **Evaluation Data Analysis** | 4 | - Synthesize user testing findings<br/>- Calculate SUS score (if using SUS scale)<br/>- Identify top 3 usability issues<br/>- Analyze expert review responses<br/>- Write 2-3 page evaluation summary<br/>- Document findings for final paper |
| **Advanced Analytics Features** | 5 | - Item analysis: difficulty ranking (% correct)<br/>- Error pattern detection: most common wrong answers<br/>- Time-to-complete analysis per question<br/>- Comparative analytics: student vs baseline<br/>- Enhanced CSV exports with calculated metrics |
| **Fixes Based on Feedback** | 4 | - Prioritize top 3 usability issues<br/>- Implement fixes<br/>- Quick regression test<br/>- Document what changed and why |

**Total**: 36 hours
**Deliverable**: Evaluation data, advanced features, user-validated design

---

### WEEK 16: Final Polish & Deliverables (Dec 9-15)
**Theme**: Documentation, presentation, deployment

**Goals**:
- Landing page
- Complete documentation
- Final video
- Academic paper
- Deployment

**Tasks**:

| Task | Hours | Definition of Done |
|------|-------|-------------------|
| **Certificate Generator** | 3 | - HTML Canvas generates certificate PNG<br/>- Shows: student name, module name, completion date, OffGrid English logo<br/>- Cameroonian colors (green/yellow/red border)<br/>- "Download Certificate" button<br/>- "Share Certificate" via Web Share API<br/>- Professional design (template-based) |
| **Landing Page** | 6 | - Create separate landing page:<br/>  - Hero section (screenshot + tagline)<br/>  - Features overview (6-8 key features)<br/>  - Demo video embed (from Milestone 2)<br/>  - Download/Install instructions<br/>  - Testimonials (if available from expert review)<br/>  - Footer: GitHub, contact<br/>- Responsive design<br/>- Deploy to Netlify/Vercel<br/>- SEO optimized (meta tags, Open Graph) |
| **User Guide (PDF)** | 4 | - Create 8-12 page PDF:<br/>  - Getting started<br/>  - How to practice<br/>  - Understanding feedback<br/>  - Using offline mode<br/>  - Tracking progress<br/>  - FAQ<br/>- Screenshots for each section<br/>- Simple, clear language<br/>- Available in app as downloadable PDF |
| **Teacher Guide (PDF)** | 3 | - Create 5-8 page PDF:<br/>  - Using teacher validation<br/>  - Interpreting analytics<br/>  - Reviewing Q&A queue<br/>  - Exporting data (CSV)<br/>  - Best practices for classroom integration<br/>- Screenshots and examples |
| **Technical Documentation** | 5 | - Update README.md:<br/>  - Architecture overview<br/>  - Setup instructions<br/>  - Build/deploy guide<br/>  - API/data structure docs<br/>  - Contributing guidelines<br/>- Architecture diagrams (update from proposal)<br/>- Privacy policy (no PII, anonymous ID)<br/>- License (MIT)<br/>- Changelog |
| **Final Demo Video** | 6 | - Record 10-min professional video:<br/>  1. Introduction (problem, solution)<br/>  2. Live demo (end-to-end user journey)<br/>  3. Highlight 10 key features<br/>  4. Show offline proof<br/>  5. Analytics demonstration<br/>  6. Teacher validation flow<br/>  7. CSV exports<br/>  8. Mobile responsiveness<br/>  9. Evaluation results summary<br/>  10. Future work<br/>- Professional editing (screen + voice)<br/>- Closed captions |
| **Academic Paper (10-15 pages)** | 10 | - Structure:<br/>  1. Introduction (problem, gap, vision)<br/>  2. Related Work (Assignments 1-3 synthesis)<br/>  3. Method (architecture, features, evaluation)<br/>  4. Results (evaluation findings, metrics)<br/>  5. Discussion (interpretation, limitations)<br/>  6. Future Work<br/>  7. Conclusion<br/>  8. References<br/>- Include figures: architecture, feature map, analytics screenshots<br/>- ACM or IEEE format |
| **Final Presentation Slides** | 2 | - 15-20 slides covering paper content<br/>- Visuals: screenshots, diagrams, data<br/>- Speaking notes |
| **Deployment & Final Checks** | 3 | - Deploy to Netlify (production)<br/>- Verify HTTPS works<br/>- Test PWA install on Android<br/>- Smoke test all features production<br/>- Verify analytics tracking (if added)<br/>- Final Lighthouse audit |
| **GitHub Polish** | 2 | - Add badges: PWA, TypeScript, License<br/>- Update README with live demo link<br/>- Add screenshots to README<br/>- Create GitHub releases/tags<br/>- Clean up branches<br/>- Archive development branches |
| **Final Submission Preparation** | 2 | - Create ZIP with:<br/>  - Catalog.pdf (structure, build steps, Netlify URL)<br/>  - Source code<br/>  - Evaluation dossier<br/>  - Sample CSVs<br/>  - Playwright test results<br/>- Verify all files included<br/>- Test ZIP extraction |

**Total**: 46 hours
**Deliverable**: Complete portfolio-ready project with all documentation

---

## CUMULATIVE HOURS BREAKDOWN

| Week | Theme | Hours | Cumulative |
|------|-------|-------|------------|
| 11 | Enhanced UI/UX + Analytics | 28 | 28 |
| 12 | Smart Learning Features | 38 | 66 |
| 13 | Mobile Excellence + Milestone 2 | 32 | 98 |
| 14 | Testing & QA | 28 | 126 |
| 15 | Evaluation & Advanced Features | 36 | 162 |
| 16 | Final Polish & Deliverables | 46 | 208 |

**Total**: ~208 hours (≈35 hrs/week average)

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Voice Input browser compatibility** | Medium | Medium | - Make optional with clear fallback<br/>- Test on 3 browsers<br/>- Graceful degradation documented |
| **User testing recruitment (<3 participants)** | Medium | Low | - Strengthen heuristic evaluation<br/>- Document as limitation<br/>- Use classmates as backup |
| **Week 14-15 time crunch** | Medium | Medium | - Tier 3 features can be reduced<br/>- Focus on Tier 1 (CORE) first<br/>- Certificate generator can move to "future work" |
| **Evaluation data insufficient** | Low | Medium | - Supplement with analytics from own testing<br/>- Use simulated learner data<br/>- Focus on feasibility over effectiveness |
| **Bundle size exceeds 250KB** | Low | High | - Remove unused Tailwind utilities<br/>- Tree-shake Recharts (import only needed charts)<br/>- Dynamic imports for routes<br/>- Use vite-bundle-visualizer to identify large deps |
| **Mentor asks to reduce scope** | Low | High | - Provide tiered fallback:<br/>  - Plan A: All 21 features<br/>  - Plan B: 10 CORE + 3 STRONG = 13 features<br/>  - Plan C: 10 CORE only<br/>- All plans maintain offline-first + research grounding |

---

## SUCCESS CRITERIA

### Technical Gates (Must Pass)
- ✅ PWA Lighthouse score ≥90
- ✅ Accessibility WCAG 2.1 AA compliant
- ✅ Playwright offline test: 0 network requests
- ✅ Bundle size ≤250KB gzipped
- ✅ Works on Android 8+ and iOS 14+
- ✅ TypeScript strict mode, 0 errors

### Feature Gates (Must Complete)
- ✅ All 10 CORE features implemented and tested
- ✅ At least 3 STRONG features working
- ✅ Teacher validation + analytics functional
- ✅ CSV exports working for all data
- ✅ Offline mode proven (automated test)

### Evaluation Gates (Must Document)
- ✅ User testing with ≥3 participants
- ✅ Expert review with ≥3 ESL educators
- ✅ Heuristic evaluation completed
- ✅ Evaluation summary (2-3 pages) written

### Documentation Gates (Must Deliver)
- ✅ Academic paper (10-15 pages)
- ✅ Final demo video (10 min)
- ✅ User guide + Teacher guide
- ✅ Technical documentation
- ✅ Landing page deployed

---

## WEEKLY CHECKPOINT QUESTIONS

### Week 11
- ❓ Is the analytics dashboard with charts acceptable (vs tables-only proposal)?
- ❓ Are the Cameroonian scenarios culturally appropriate?
- ❓ Any concerns about dark mode implementation?

### Week 12
- ❓ Is the personalized learning path algorithm too complex?
- ❓ Should spaced repetition use SM-2 or simpler intervals?
- ❓ Any feedback on achievement design?

### Week 13
- ❓ Voice input: acceptable to make optional with fallback?
- ❓ Milestone 2 video submitted on time?
- ❓ Any scope adjustments needed?

### Week 14
- ❓ Testing coverage sufficient?
- ❓ Any critical bugs blocking progress?

### Week 15
- ❓ Evaluation data collection going well?
- ❓ Any ethical concerns with user testing?

### Week 16
- ❓ Final deliverables aligned with expectations?
- ❓ Any last-minute adjustments needed?

---

## TOOLS & LIBRARIES SUMMARY

```bash
# Week 11 installations
npm install framer-motion recharts

# Week 13 installations (if needed)
npm install react-swipeable

# Week 14 installations
npm install -D @playwright/test @axe-core/react

# Optional (Week 16)
npm install html2canvas jspdf  # For certificate/PDF generation
```

**Total Cost**: $0 (all MIT/Apache 2.0 licensed)

---

## FALLBACK TIERS

### Plan A: Full Implementation (21 features)
- All features as listed above
- Target: Week 16 completion

### Plan B: Core + Strong (15 features)
- All 10 CORE features
- 5 STRONG features
- Defer: Challenge Mode, Certificate Generator, some Tier 3
- Target: Week 15 completion with buffer

### Plan C: Core Only (10 features)
- 10 CORE features only
- All research-critical features maintained
- Document others as "Future Work"
- Target: Week 14 completion with extensive testing

**Recommendation**: Start with Plan A, drop to Plan B only if Week 13 checkpoint reveals delays.

---

## NEXT STEPS

1. **Send mentor approval request** (with diagram + research grounding)
2. **Wait for mentor response** (expect 1-3 days)
3. **If approved**: Begin Week 11 tasks immediately
4. **If adjustments needed**: Revise plan and resubmit

---

**Document Created**: October 28, 2025
**Project**: OffGrid English - CS 6460 Educational Technology
**Student**: Erdem Acarkan (eacarkan3@gatech.edu)
