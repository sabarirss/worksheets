# Assessment Usage Guide

## Module Age/Level Determination

This document clarifies which modules use assessment results vs child's actual age from DOB.

---

## ✅ Modules Using ASSESSMENT Results

### 1. **Mathematics (worksheet-generator.js)**
- **Uses**: Assessment results per operation
- **Why**: Different operations (addition, subtraction, multiplication, division) have different skill levels
- **Assessment Required**: Yes, per operation
- **Fallback**: If no assessment, uses age-appropriate default level

### 2. **English (english-generator.js)**
- **Uses**: Assessment results for writing worksheets
- **Why**: Writing skills vary significantly regardless of age
- **Assessment Required**: Yes
- **Fallback**: If no assessment, uses age-appropriate default level

---

## 📅 Modules Using ACTUAL AGE (from DOB)

### 3. **Aptitude & Logic Puzzles**
- **Uses**: Child's actual age calculated from date of birth
- **Why**: Logic development correlates with age
- **Assessment**: Not used
- **Content**: Age-appropriate puzzles (patterns, counting, sequences, matching, etc.)

### 4. **Stories (Story Time)**
- **Uses**: Child's actual age from DOB
- **Why**: Reading comprehension and vocabulary appropriate for age
- **Assessment**: Not used
- **Content**: Age-appropriate stories (animals, nature, family, etc.)

### 5. **Drawing Tutorials**
- **Uses**: Child's actual age from DOB
- **Why**: Fine motor skills and artistic complexity correlate with age
- **Assessment**: Not used
- **Content**: Age-appropriate drawing difficulty

### 6. **Emotional Quotient (EQ)**
- **Uses**: Child's actual age from DOB
- **Why**: Emotional and social development tied to age
- **Assessment**: Not used
- **Content**: Age-appropriate social scenarios

### 7. **German Kids**
- **Uses**: Child's actual age from DOB
- **Why**: Language learning content appropriate for developmental stage
- **Assessment**: Not used
- **Content**: Age-appropriate German stories and vocabulary

### 8. **German B1 (Adult DTZ Test Prep)**
- **Uses**: Child's actual age from DOB (mostly for adults)
- **Why**: Test preparation content
- **Assessment**: Not used
- **Content**: B1-level German for DTZ test

### 9. **Learn English Stories**
- **Uses**: Child's actual age from DOB
- **Why**: English reading level appropriate for age
- **Assessment**: Not used
- **Content**: Age-appropriate English learning stories

---

## Implementation Details

### How Assessment Works (Math & English Only)

```javascript
// Check if assessment completed for this operation
const child = getSelectedChild();
if (!child.assessmentCompleted || !child.assessmentCompleted[`math_${operation}`]) {
    // Redirect to assessment
    window.location.href = `assessment.html?module=math&operation=${operation}`;
    return;
}

// Use assessment result
const assessmentResult = child.assessmentCompleted[`math_${operation}`];
const startLevel = assessmentResult.level;
```

### How DOB Age Works (All Other Modules)

```javascript
// Get child's actual age from DOB
const child = getSelectedChild();
const childAge = child.age; // Calculated from date_of_birth field

// Use age directly to determine content
const ageGroup = ageGroupMap[childAge]; // Maps to '4-5', '6', '7', etc.
const content = getContentByAge(ageGroup, difficulty);
```

---

## Age Group Mapping

| Child's Age | Age Group | Difficulty Levels |
|-------------|-----------|-------------------|
| 4-5 years | '4-5' | Easy, Medium, Hard |
| 6 years | '6' | Easy, Medium, Hard |
| 7 years | '7' | Easy, Medium, Hard |
| 8 years | '8' | Easy, Medium, Hard |
| 9+ years | '9+' | Easy, Medium, Hard |
| 10+ years | '10+' | Easy, Medium, Hard |

---

## For Developers

### Adding a New Module - Decision Tree

**Does the module teach a specific skill that varies significantly between children of the same age?**
- **YES** (like Math, English writing) → Use Assessment
- **NO** (like Stories, Drawing, EQ) → Use DOB Age

**Examples:**
- ✅ **Use Assessment**: Piano lessons (skill-based, not age-based)
- ❌ **Use DOB Age**: Animal facts (comprehension based on age)

### Code Template for DOB-Based Modules

```html
<!-- In module.html -->
<script>
    firebase.auth().onAuthStateChanged(async function(user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const child = getSelectedChild();
        if (!child || !child.age) {
            alert('Please select a child profile first');
            window.location.href = 'children-profiles.html';
            return;
        }

        // For [MODULE]: Always use actual age from DOB (no assessment)
        const childAge = child.age.toString();
        console.log('[MODULE]: Using actual age from DOB:', childAge);

        setTimeout(function() {
            if (typeof currentAge !== 'undefined') {
                currentAge = childAge;
            }
        }, 200);
    });
</script>
```

### Code Template for Assessment-Based Modules

```html
<!-- In module.html -->
<script>
    firebase.auth().onAuthStateChanged(async function(user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const child = getSelectedChild();
        if (!child) {
            alert('Please select a child profile first');
            window.location.href = 'children-profiles.html';
            return;
        }

        // For [MODULE]: Check assessment results
        if (!child.assessmentCompleted || !child.assessmentCompleted['module_topic']) {
            window.location.href = 'assessment.html?module=module&topic=topic';
            return;
        }

        const assessmentLevel = child.assessmentCompleted['module_topic'].level;
        console.log('[MODULE]: Using assessment level:', assessmentLevel);
    });
</script>
```

---

## Console Log Messages

When debugging, look for these console messages:

### Assessment-Based (Math, English):
```
Math: Using assessment level for addition: 5
English: Using assessment level for writing: 3
```

### DOB-Based (All Others):
```
Aptitude: Using actual age from DOB: 7
Stories: Using actual age from DOB: 6
Drawing: Using actual age from DOB: 8
EQ: Using actual age from DOB: 9
German Kids: Using actual age from DOB: 6
Learn English Stories: Using actual age from DOB: 7
```

---

## User Experience

### For Parents/Children:

**Math & English:**
- First time accessing an operation → Take assessment
- Assessment determines starting difficulty
- Progress tracked per operation
- Can retake assessment anytime

**All Other Modules:**
- Instant access, no assessment needed
- Content automatically appropriate for child's age
- Age calculated from date of birth
- Updates automatically on birthdays

---

## Benefits of This Approach

### Assessment-Based (Math & English):
✅ Personalized to actual skill level
✅ Not limited by age
✅ Gifted children can advance faster
✅ Struggling children get appropriate support

### DOB-Based (Other Modules):
✅ No assessment burden
✅ Immediate access
✅ Age-appropriate development
✅ Simpler user experience

---

## Future Considerations

If a module's usage shows that children of the same age have vastly different capabilities, consider adding assessment:
- Track completion rates by age
- Monitor difficulty selection patterns
- Parent feedback on appropriateness
- Child frustration/success indicators

---

Last Updated: 2026-02-16
