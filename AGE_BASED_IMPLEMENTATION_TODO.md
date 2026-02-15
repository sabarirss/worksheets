# Age-Based Difficulty Mapping - Implementation TODO

## 📋 Current Status: Phase 1 - Content Creation In Progress

**Date**: 2026-02-15
**Completed By**: Claude Sonnet 4.5

---

## ✅ COMPLETED

### 1. **Critical Bug Fixes**
- ✅ Fixed profile selector error for existing users (commit: 5eabed4)
- ✅ Removed old level names from settings (commit: b78663f)

### 2. **Content Audit**
- ✅ Audited all 8 modules for age-differentiation readiness
- ✅ Created CONTENT_AUDIT_REPORT.md with findings
- ✅ Identified: 5 modules ready, 3 need work

### 3. **Foundation Files Created**
- ✅ `age-content-mapper.js` - Core utility for age-based content mapping
  - getContentMapping() function
  - getNumberRange() for age-appropriate numbers
  - getVocabularyLevel() for language complexity
  - filterByAge() for content filtering
  - getAgeAppropriateInstruction() for simplified language

- ✅ `aptitude-age-content.js` - Age-differentiated patterns
  - 126 pattern puzzles across 6 age groups × 3 difficulties
  - Age-based counting configurations
  - Number ranges per age

### 4. **Aptitude Module - Partial Implementation**
- ✅ Backed up original: aptitude-generator.js.backup
- ✅ Modified loadPuzzles() to pass currentAge to generators
- ⏳ Still need to modify 7 generator functions (see below)

---

## 🔄 IN PROGRESS - Aptitude Module

### **What's Done:**
- loadPuzzles() now passes age to all generators
- Created comprehensive age-based pattern content

### **What's Needed:**

#### Step 1: Modify Generator Function Signatures
All 7 generators need to accept age parameter:

```javascript
// BEFORE:
function generatePatternPuzzles(count, difficulty) { ... }

// AFTER:
function generatePatternPuzzles(count, difficulty, age) { ... }
```

**Files to modify**: aptitude-generator.js
- Line ~160: generatePatternPuzzles(count, difficulty, age)
- Line ~220: generateCountingPuzzles(count, difficulty, age)
- Line ~280: generateSequencePuzzles(count, difficulty, age)
- Line ~340: generateMatchingPuzzles(count, difficulty, age)
- Line ~400: generateOddOnePuzzles(count, difficulty, age)
- Line ~460: generateComparisonPuzzles(count, difficulty, age)
- Line ~520: generateLogicPuzzles(count, difficulty, age)

#### Step 2: Integrate Age-Based Content

**For Pattern Puzzles**:
```javascript
function generatePatternPuzzles(count, difficulty, age) {
    // Load age-based patterns from aptitude-age-content.js
    const ageGroup = ageGroupMap[age.toString()] || '6';
    const patterns = ageBasedPatterns[ageGroup][difficulty];

    return patterns.slice(0, count).map(p => ({
        type: 'pattern',
        pattern: p.pattern,
        answer: p.answer,
        options: p.options,
        reason: p.reason
    }));
}
```

**For Counting Puzzles**:
```javascript
function generateCountingPuzzles(count, difficulty, age) {
    const ageGroup = ageGroupMap[age.toString()] || '6';
    const config = ageBasedCounting[ageGroup];
    const { min, max } = config.range;

    // Generate counts within age-appropriate range
    const puzzles = [];
    for (let i = 0; i < count; i++) {
        const itemCount = Math.floor(Math.random() * (max - min + 1)) + min;
        const item = config.items[i % config.items.length];

        puzzles.push({
            type: 'counting',
            emoji: item,
            count: itemCount,
            answer: itemCount.toString()
        });
    }
    return puzzles;
}
```

**For Other Puzzles** (Sequences, Matching, etc.):
- Use getNumberRange(age) for number-based puzzles
- Use filterByAge() to select appropriate items
- Use getAgeAppropriateInstruction() to simplify instructions

#### Step 3: Load Content File
Add to aptitude.html:
```html
<script src="age-content-mapper.js"></script>
<script src="aptitude-age-content.js"></script>
<script src="aptitude-generator.js"></script>
```

---

## ⏳ TODO - Stories Module

### **Current Issue:**
- Stories module has age selection UI
- But generateStories(category, difficulty) ignores age
- Age 6 Easy = Age 10+ Easy (same stories)

### **Implementation Plan:**

#### Step 1: Create Age-Based Story Templates

**File to create**: `stories-age-content.js`

**Structure needed**:
```javascript
const ageBasedStories = {
    '4-5': {
        easy: {
            animals: [ /* 10+ simple animal stories */ ],
            nature: [ /* 10+ nature stories */ ],
            // ... other categories
        },
        medium: { /* ... */ },
        hard: { /* ... */ }
    },
    // ... repeat for ages 6, 7, 8, 9+, 10+
};
```

**Story Complexity by Age:**
- **Age 4-5**: 3-4 sentences, simple words, basic morals
- **Age 6**: 5-6 sentences, sight words, clear lessons
- **Age 7**: 7-8 sentences, descriptive words, character development
- **Age 8**: 10+ sentences, complex vocabulary, multi-step plots
- **Age 9+**: 12+ sentences, abstract concepts, nuanced themes
- **Age 10+**: 15+ sentences, sophisticated language, deep lessons

#### Step 2: Modify Stories Generator

**File to modify**: stories-generator.js

**Line ~161**: Change generateStories():
```javascript
function generateStories(category, difficulty) {
    // Add age parameter
    const ageGroup = ageGroupMap[currentAge.toString()] || '6';

    // Load age-appropriate stories
    if (typeof ageBasedStories !== 'undefined' &&
        ageBasedStories[ageGroup] &&
        ageBasedStories[ageGroup][difficulty] &&
        ageBasedStories[ageGroup][difficulty][category]) {
        return ageBasedStories[ageGroup][difficulty][category];
    }

    // Fallback to original stories
    return [];
}
```

#### Step 3: Adjust Story Templates
- Simplify language for younger ages using getAgeAppropriateInstruction()
- Adjust story length by age
- Use age-appropriate vocabulary

---

## ⏳ TODO - EQ Module

### **Current Issue:**
- EQ module has age selection UI
- But generators don't use age for scenario complexity
- All ages see same emotional scenarios

### **Implementation Plan:**

#### Step 1: Create Age-Based EQ Scenarios

**File to create**: `eq-age-content.js`

**Emotional Complexity by Age:**
- **Age 4-5**: Basic emotions (happy, sad, angry, scared)
- **Age 6**: Adding (surprised, excited, frustrated)
- **Age 7**: Understanding others' feelings (empathy basics)
- **Age 8**: Complex emotions (disappointed, proud, jealous)
- **Age 9+**: Social situations (peer pressure, conflict resolution)
- **Age 10+**: Abstract emotions (anxiety, confidence, self-esteem)

**Structure needed**:
```javascript
const ageBasedEQScenarios = {
    '4-5': {
        easy: [
            {
                situation: "Your friend is crying.",
                question: "What should you do?",
                options: [
                    "Give them a hug",
                    "Laugh at them",
                    "Walk away",
                    "Yell at them"
                ],
                correct: 0,
                explanation: "When friends are sad, we help them feel better!"
            },
            // ... 10+ scenarios
        ],
        medium: [ /* ... */ ],
        hard: [ /* ... */ ]
    },
    // ... repeat for all age groups
};
```

#### Step 2: Modify EQ Generator

**File to modify**: eq-generator.js

**Find scenario generation function and add age logic:**
```javascript
function loadScenarios(difficulty) {
    const ageGroup = ageGroupMap[currentAge.toString()] || '6';

    // Load age-appropriate EQ scenarios
    if (typeof ageBasedEQScenarios !== 'undefined') {
        return ageBasedEQScenarios[ageGroup][difficulty];
    }

    // Fallback
    return [];
}
```

---

## 🚀 PHASE 2 - Remove Age Selection UI & Implement Auto-Mapping

**After Phase 1 content is complete, implement for ALL 8 modules:**

### Step 1: Remove Age Selection UI from HTML Files

**Files to modify:**
- aptitude.html (remove age-selection div)
- stories.html (remove age-selection div)
- emotional-quotient.html (remove age-selection div)
- learn-english-stories.html (already age-based, simplify)

**Also check:**
- drawing.html
- german-kids.html

### Step 2: Auto-Detect Age from Selected Child

**Add to each module's JavaScript:**
```javascript
// Auto-detect child's age on page load
firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Get selected child's age
    const child = getSelectedChild();
    if (!child || !child.age) {
        alert('Please select a child profile first');
        window.location.href = 'children-profiles.html';
        return;
    }

    // Set current age automatically
    currentAge = child.age.toString();

    // Show operation/type selection (skip age selection)
    document.getElementById('operation-selection').style.display = 'block';
});
```

### Step 3: Implement Content Mapping

**For each module, when user selects difficulty:**

```javascript
function selectDifficulty(selectedDifficulty) {
    // Get content mapping based on child's age and selected difficulty
    const mappings = getContentMapping(currentAge, selectedDifficulty);

    // Load content from mapped age groups and difficulties
    const allContent = [];
    mappings.forEach(mapping => {
        const content = loadContentFor(mapping.ageGroup, mapping.difficulty);
        allContent.push(...content);
    });

    // Shuffle and present combined content
    displayContent(shuffle(allContent));
}
```

**Mapping Logic** (from age-content-mapper.js):
- Easy = Previous age Hard
- Medium = Current age (Easy + Medium + Hard combined)
- Hard = Next age Hard

**Edge Cases:**
- Age 4-5 Easy: Use own easy (no previous age)
- Age 10+ Hard: Use own hard (no next age)

---

## 🎨 PHASE 3 - Design Consistency Review

**After implementation, review all pages for:**

### 1. Header Consistency
- Profile selector in same position
- Same gradient colors
- Consistent logo/title styling

### 2. Button Styling
- Same colors: primary (purple gradient), secondary (blue gradient)
- Same sizes: large (for main actions), medium (for navigation)
- Same border radius: 10-15px
- Same hover effects

### 3. Card/Section Styling
- Same background colors
- Same shadows: `box-shadow: 0 5px 20px rgba(0,0,0,0.1)`
- Same padding: 20-30px
- Same border-radius: 15px

### 4. Typography
- Consistent font sizes for h1, h2, h3
- Consistent colors: headings (#2c3e50), body (#666)
- Consistent line-height for readability

### 5. Child-Friendly Elements
- Large touch targets (min 44px × 44px)
- Bright, cheerful colors
- Emoji usage for visual interest
- Clear, simple language
- Large fonts for young readers

### 6. Responsive Design
- Test on mobile (320px - 767px)
- Test on tablet (768px - 1023px)
- Test on desktop (1024px+)
- Ensure text is readable at all sizes
- Ensure buttons are tappable on touch devices

### Files to Review:
- index.html (dashboard)
- All 8 module HTML files
- children-profiles.html
- admin.html
- settings.html

---

## 📊 Progress Tracker

| Task | Status | Estimated Time |
|------|--------|----------------|
| ✅ Age content mapper utility | Complete | - |
| ✅ Content audit | Complete | - |
| ⏳ Aptitude module content | 40% | 2-3 hours |
| ⏳ Stories module content | 0% | 2-3 hours |
| ⏳ EQ module content | 0% | 1-2 hours |
| ⏳ Remove age selection UI | 0% | 1 hour |
| ⏳ Implement auto-mapping | 0% | 2-3 hours |
| ⏳ Design consistency review | 0% | 2-3 hours |
| **TOTAL REMAINING** | | **10-15 hours** |

---

## 🔑 Key Files Reference

### Created/Modified:
- `age-content-mapper.js` - Core utility (COMPLETE)
- `aptitude-age-content.js` - Pattern content (COMPLETE)
- `aptitude-generator.js` - Modified to use age (PARTIAL)
- `CONTENT_AUDIT_REPORT.md` - Audit findings (COMPLETE)
- `AGE_BASED_IMPLEMENTATION_TODO.md` - This file (COMPLETE)

### To Create:
- `stories-age-content.js` - Age-based stories
- `eq-age-content.js` - Age-based EQ scenarios

### To Modify:
- `stories-generator.js` - Add age logic
- `eq-generator.js` - Add age logic
- All 8 module HTML files - Remove age selection, add auto-detection
- `aptitude-generator.js` - Complete generator modifications

---

## 🚦 Next Session Start Point

**When continuing:**

1. **Load this file** (AGE_BASED_IMPLEMENTATION_TODO.md)
2. **Start with**: Complete Aptitude module (Step 1 & 2 above)
3. **Then**: Stories module content creation
4. **Then**: EQ module content creation
5. **Then**: Phase 2 (UI removal & auto-mapping)
6. **Finally**: Phase 3 (design review)

**Test after each module:**
- Create child profile with specific age
- Navigate to module
- Verify age-appropriate content loads
- Verify difficulty mapping works correctly

---

## 💡 Implementation Tips

1. **Use age-content-mapper.js functions consistently** across all modules
2. **Keep ageGroupMap consistent**: ages 4-16 map to groups 4-5, 6, 7, 8, 9+, 10+
3. **Test with real child profiles** of different ages
4. **Verify progressive difficulty** within each age (easy < medium < hard)
5. **Check edge cases**: age 4 (youngest), age 16+ (oldest)
6. **Ensure smooth UX**: no age selection = faster experience

---

**Good luck with Phase 2! All foundation work is complete.**
