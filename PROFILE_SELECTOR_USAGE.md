# Profile Selector Component - Usage Guide

## Overview

The Profile Selector component allows parents to manage and switch between multiple children profiles. Each child has their own name, age, gender, and grade information that can be used to personalize worksheets and activities.

## Features

- **Multi-child Support**: Parents can create profiles for multiple children
- **Easy Switching**: Dropdown selector in the header allows quick switching between children
- **Persistent Selection**: Selected child persists across page navigations and browser sessions (localStorage)
- **Child Information**: Stores name, age, gender, grade, and date of birth
- **Avatar Display**: Shows appropriate emoji (👦 for boy, 👧 for girl, 👶 for other)
- **Mobile Responsive**: Works seamlessly on mobile, tablet, and desktop devices

## Setup

### 1. Include Required Scripts

Add these scripts to your HTML page (after Firebase scripts):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Firebase Config -->
<script src="firebase-config.js"></script>

<!-- Firebase Auth & Storage -->
<script src="firebase-auth.js"></script>
<script src="firebase-storage.js"></script>
<script src="age-filter.js"></script>
<script src="profile-selector.js"></script>
```

### 2. Add Container to Header

Add a container div in your page header where the profile selector will be rendered:

```html
<div class="user-header">
    <div class="user-info">
        <span>👤</span>
        <strong id="user-name-display"></strong>
    </div>
    <div class="user-actions">
        <!-- Profile Selector Container -->
        <div id="profile-selector-container"></div>

        <button class="header-btn" onclick="logout()">Logout</button>
    </div>
</div>
```

## Using getSelectedChild() in Your Worksheets

### Function Signature

```javascript
function getSelectedChild()
```

### Returns

Returns an object with the selected child's information, or `null` if no child is selected:

```javascript
{
    id: "abc123",           // Firestore document ID
    name: "Emma",           // Child's name
    age: 7,                 // Calculated age (updated from date_of_birth)
    gender: "girl",         // "boy", "girl", or "other"
    grade: "2nd",           // Current grade
    date_of_birth: "2017-03-15"  // Birth date (YYYY-MM-DD format)
}
```

### Example Usage

#### Basic Usage - Get Child Information

```javascript
// Get the selected child
const child = getSelectedChild();

if (child) {
    console.log(`Generating worksheet for ${child.name}, age ${child.age}`);
} else {
    console.log('No child selected');
    // Optionally redirect to children-profiles.html
    // window.location.href = 'children-profiles.html';
}
```

#### Personalized Worksheet Title

```javascript
function generateWorksheet() {
    const child = getSelectedChild();

    if (!child) {
        alert('Please select a child profile first');
        window.location.href = 'children-profiles.html';
        return;
    }

    // Personalize the worksheet with child's name
    const title = document.getElementById('worksheet-title');
    title.textContent = `${child.name}'s Math Practice`;

    // Add child's name to worksheet content
    const header = document.querySelector('.worksheet-header');
    header.innerHTML = `
        <h1>Practice Worksheet</h1>
        <p>Name: ${child.name}</p>
        <p>Age: ${child.age}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
    `;
}
```

#### Age-Appropriate Content

```javascript
function generateStory() {
    const child = getSelectedChild();

    if (!child) {
        alert('Please select a child first');
        return;
    }

    // Select age-appropriate story difficulty
    let difficulty;
    if (child.age <= 5) {
        difficulty = 'simple';
    } else if (child.age <= 8) {
        difficulty = 'intermediate';
    } else {
        difficulty = 'advanced';
    }

    // Generate story with appropriate difficulty
    const story = storyDatabase[difficulty];
    displayStory(story, child.name);
}
```

#### Gender-Specific Content

```javascript
function generateDrawingPrompt() {
    const child = getSelectedChild();

    if (!child) return;

    // Use gender for avatar display
    const avatar = child.gender === 'boy' ? '👦' :
                   child.gender === 'girl' ? '👧' : '👶';

    const prompt = document.getElementById('drawing-prompt');
    prompt.innerHTML = `
        <div class="child-avatar">${avatar}</div>
        <p>Hi ${child.name}! Let's draw together!</p>
    `;
}
```

#### Save Worksheet with Child Context

```javascript
async function saveWorksheet(worksheetData) {
    const child = getSelectedChild();

    if (!child) {
        alert('No child selected');
        return;
    }

    // Save worksheet associated with the child
    const worksheetDoc = {
        child_id: child.id,
        child_name: child.name,
        child_age: child.age,
        worksheet_type: 'math',
        content: worksheetData,
        completed_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await firebase.firestore()
            .collection('worksheets')
            .add(worksheetDoc);

        console.log(`Worksheet saved for ${child.name}`);
    } catch (error) {
        console.error('Error saving worksheet:', error);
    }
}
```

#### Check if Child is Selected

```javascript
// Use the helper function
if (isChildSelected()) {
    generateWorksheet();
} else {
    showChildSelectionPrompt();
}
```

## Additional Helper Functions

### isChildSelected()

Check if a child is currently selected:

```javascript
if (isChildSelected()) {
    // Proceed with worksheet generation
} else {
    // Show selection prompt
}
```

### clearSelectedChild()

Clear the selected child (useful for logout):

```javascript
function logout() {
    clearSelectedChild(); // Clear child selection
    firebase.auth().signOut();
    window.location.href = 'login.html';
}
```

## Best Practices

1. **Always check for null**: Always check if `getSelectedChild()` returns null before using child data
2. **Redirect when no child**: If no child is selected, consider redirecting to `children-profiles.html`
3. **Personalize content**: Use child's name and age to make worksheets more engaging
4. **Age-appropriate content**: Adjust difficulty and content based on child's age
5. **Save with context**: Always associate saved worksheets with the child's ID

## Example: Complete Worksheet Generator

```javascript
function generateMathWorksheet(operation, difficulty) {
    // 1. Get selected child
    const child = getSelectedChild();

    // 2. Validate child is selected
    if (!child) {
        alert('Please select a child profile first');
        window.location.href = 'children-profiles.html';
        return;
    }

    // 3. Personalize worksheet header
    const header = document.getElementById('worksheet-header');
    header.innerHTML = `
        <div class="child-info">
            <span class="avatar">${child.gender === 'boy' ? '👦' : '👧'}</span>
            <span class="name">${child.name}</span>
            <span class="age">Age ${child.age}</span>
        </div>
        <h1>${operation} Practice</h1>
        <p class="date">${new Date().toLocaleDateString()}</p>
    `;

    // 4. Adjust difficulty based on age
    let problemCount;
    let maxNumber;

    if (child.age <= 5) {
        problemCount = 5;
        maxNumber = 10;
    } else if (child.age <= 8) {
        problemCount = 10;
        maxNumber = 20;
    } else {
        problemCount = 15;
        maxNumber = 100;
    }

    // 5. Generate problems
    const problems = generateProblems(operation, difficulty, problemCount, maxNumber);

    // 6. Display problems
    displayProblems(problems, child.name);

    // 7. Save metadata
    sessionStorage.setItem('currentWorksheet', JSON.stringify({
        child_id: child.id,
        child_name: child.name,
        operation: operation,
        difficulty: difficulty,
        generated_at: new Date().toISOString()
    }));
}
```

## Troubleshooting

### Profile Selector Not Showing

1. Check that `profile-selector.js` is included in your HTML
2. Verify the container div exists: `<div id="profile-selector-container"></div>`
3. Make sure Firebase is initialized before profile selector loads
4. Check browser console for JavaScript errors

### getSelectedChild() Returns Null

1. Verify a child profile has been created in `children-profiles.html`
2. Check that a child has been selected from the dropdown
3. Ensure sessionStorage is not being cleared
4. Check browser console for errors

### Selected Child Not Persisting

1. SessionStorage is cleared on browser close - this is expected behavior
2. SessionStorage is domain-specific - ensure all pages are on same domain
3. Check that `selectChild()` is being called when selecting from dropdown

## File Structure

```
/home/sabari/kumon-claude/
├── profile-selector.js          # Profile selector component
├── children-profiles.html        # Manage children profiles
├── index.html                   # Main dashboard (includes selector)
├── english.html                 # English module (includes selector)
├── math.html                    # Math module (includes selector)
├── aptitude.html                # Aptitude module (includes selector)
└── ... (all other module pages)
```

## Complete Implementation Checklist

- [x] Created `profile-selector.js` with all functions
- [x] Added script include to `index.html`
- [x] Added script include to all module pages
- [x] Added container div to page headers
- [x] Updated mobile responsive styles
- [x] Implemented `getSelectedChild()` helper
- [x] Implemented `isChildSelected()` helper
- [x] Implemented `clearSelectedChild()` helper
- [x] Created comprehensive documentation
- [x] Removed duplicate `getSelectedChild()` from all generators

## Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Firebase console for data issues
3. Network tab for API request failures
4. This documentation for usage examples
