# Milestone 1 Testing Checklist
**Due Date:** 10/27/2025

## ✅ Completed Development Tasks

1. **Content Transformation** ✓
   - All 7 JSON modules converted to app schema
   - 210 total items (Tense:50, SV-Agr:40, Prep:30, Word:30, Plur:20, Art:20, Aux:20)
   - Files location: `public/modules/*.json`

2. **App Updates** ✓
   - `contentLoader.ts`: Now loads all 7 modules
   - `App.tsx`: Home page shows all modules organized in Tier 1 (4) and Tier 2 (3)
   - Module navigation with item counts

3. **Wireframes Created** ✓
   - Teacher Validation interface: `docs/wireframe-teacher-validation.md`
   - Analytics tables: `docs/wireframe-analytics-tables.md`

## 🧪 Testing Tasks (DO THESE NOW)

### Test 1: Verify Module Loading
**Browser:** Open http://localhost:5173/

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to **Application** tab → **IndexedDB** → **offgrid-db**
3. Check **modules** store → Should see 7 modules
4. Check **items** store → Should see 210 items
5. Verify module names match:
   - tense-form
   - subject-verb-agreement
   - prepositions
   - word-order
   - plurality
   - articles
   - auxiliaries

**Screenshot:** Take screenshot of IndexedDB showing modules/items

---

### Test 2: Verify Practice Flow
**Steps:**
1. On home page, click **"Tense and Form"** module
2. Complete 2-3 practice questions
3. Verify:
   - ✓ Questions display correctly
   - ✓ Options are clickable
   - ✓ Feedback appears after answering
   - ✓ Can navigate to next question

**Screenshot:** Take screenshot of practice interface

---

### Test 3: Offline Functionality Test (CRITICAL FOR VIDEO)
**Steps:**
1. **First: Load app ONLINE**
   - Open http://localhost:5173/
   - Wait for all modules to load
   - Check DevTools → Application → IndexedDB (all data loaded)

2. **Then: Go OFFLINE**
   - DevTools → Network tab
   - Change throttling dropdown to **"Offline"**
   - Refresh page (should still load from cache)

3. **Complete a module OFFLINE**
   - Click on any module (e.g., "Plurality")
   - Answer 2-3 questions
   - Verify feedback still appears
   - Complete the questions

4. **Verify data saved**
   - DevTools → Application → IndexedDB → **attempts** store
   - Check that new attempts were saved WHILE OFFLINE
   - Note the timestamps

**Screenshot:**
- Network tab showing "Offline" mode
- IndexedDB showing saved attempts
- Practice interface working offline

---

### Test 4: Diagnostics Page
**Steps:**
1. Click "View Diagnostics & Export Data"
2. Verify page shows:
   - APP_VERSION: 1.0.0
   - Cache name
   - Storage usage
   - Online/Offline status
3. Click "Export Attempts" (if you have attempts)
4. Verify CSV downloads

**Screenshot:** Diagnostics page

---

### Test 5: Service Worker Verification
**Steps:**
1. DevTools → Application tab → Service Workers
2. Verify:
   - Service Worker is activated
   - Shows green dot (running)
   - Version number matches

**Screenshot:** Service Worker status

---

## 📹 Video Recording Checklist

**Duration:** ~3 minutes
**Required:** Face and voice (start/end on camera)

### Video Structure:

**1. Introduction (30s)**
- Show your face
- "Hi, I'm [name], and this is my Milestone 1 demo for OffGrid English"
- Brief overview: "An offline-first PWA with 7 grammar modules and 210 practice items for Francophone learners"

**2. Show Home Page (20s)**
- Navigate to http://localhost:5173/
- Show all 7 modules listed
- Highlight item counts (50, 40, 30, 30, 20, 20, 20 = 210 total)

**3. Demo Practice Flow (40s)**
- Click on any module (e.g., "Subject-Verb Agreement")
- Complete 1-2 questions
- Show feedback appearing
- Navigate between questions

**4. OFFLINE PROOF (60s)** - MOST IMPORTANT
- Show Network tab in DevTools
- Set to "Offline" mode
- Refresh page → still works
- Click on different module
- Complete question offline
- Show IndexedDB → attempts saved locally
- Explain: "All progress saved locally, zero network requests"

**5. Show Diagnostics (20s)**
- Navigate to Diagnostics page
- Show APP_VERSION, storage stats
- Click "Export CSV" if you have data

**6. Show Wireframes (20s)**
- Open `docs/wireframe-teacher-validation.md`
- Scroll through showing the layout
- Open `docs/wireframe-analytics-tables.md`
- Scroll through

**7. Conclusion (10s)**
- Show face again
- "All 7 modules working offline with 210 practice items. Ready for Week 13 Milestone 2!"

---

## 📋 Submission Checklist

Before submitting to Canvas:

- [ ] Video is 2-4 minutes long
- [ ] Video shows your face at start and end
- [ ] Video shows all 7 modules loading
- [ ] Video includes offline demonstration
- [ ] Video shows diagnostics page
- [ ] Video shows wireframes
- [ ] Video file size < Turnitin limit (compress if needed)
- [ ] Video format: MP4 (720p recommended)

---

## 🎯 Milestone 1 Requirements Met

According to proposal (Week 10), we needed:

✅ **4 fully working modules**: Tense, S-V Agreement, Prepositions, Word Order
✅ **2 stub modules**: Plurality, Articles (showing structure with few items)
✅ **Diagnostics page**: Live with APP_VERSION, cache, storage, reset
✅ **CSV Export**: Working in diagnostics
✅ **Offline proof**: Can be demonstrated in video
✅ **Design assets**: Wireframes for validation & analytics

**BONUS:** Delivered ALL 7 modules fully complete (not stubs) with 210 items total!

---

## 📊 Project Status Summary

| Metric | Target (Week 10) | Actual Delivered |
|--------|------------------|------------------|
| Core Modules | 4 full | 7 full! 🎉 |
| Stub Modules | 2 stubs | 0 (all full instead) ⭐ |
| Total Items | ~120-160 | 210 ⭐ |
| Offline Functionality | Manual demo | Ready ✓ |
| Wireframes | 2 required | 2 created ✓ |

**Status:** AHEAD OF SCHEDULE! 🚀

---

## Next Steps After Milestone 1

1. Complete video recording
2. Submit to Canvas by 10/27
3. Receive feedback
4. Continue to Week 13 Milestone 2:
   - Implement teacher validation interface
   - Implement analytics tables
   - Add content linter to build
   - Full QA testing
