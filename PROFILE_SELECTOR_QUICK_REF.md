# Profile Selector - Quick Reference

## Setup (One-time per page)

### 1. Add Script Tag
```html
<script src="profile-selector.js"></script>
```

### 2. Add Container Div
```html
<div id="profile-selector-container"></div>
```

## Using in Your Code

### Get Selected Child
```javascript
const child = getSelectedChild();
// Returns: { id, name, age, gender, grade, date_of_birth } or null
```

### Check if Child Selected
```javascript
if (isChildSelected()) {
    // Child is selected
}
```

### Clear Selection (Logout)
```javascript
clearSelectedChild();
```

## Quick Examples

### Personalize Title
```javascript
const child = getSelectedChild();
if (child) {
    document.title = `${child.name}'s Worksheet`;
}
```

### Age-Based Content
```javascript
const child = getSelectedChild();
if (child) {
    const difficulty = child.age <= 5 ? 'easy' :
                      child.age <= 8 ? 'medium' : 'hard';
}
```

### Gender-Based Avatar
```javascript
const child = getSelectedChild();
const avatar = child.gender === 'boy' ? '👦' :
               child.gender === 'girl' ? '👧' : '👶';
```

### Save with Child Context
```javascript
const child = getSelectedChild();
if (child) {
    await firebase.firestore().collection('worksheets').add({
        child_id: child.id,
        child_name: child.name,
        // ... other data
    });
}
```

## Child Data Structure
```javascript
{
    id: "abc123",              // Firestore doc ID
    name: "Emma",              // Child's name
    age: 7,                    // Years old
    gender: "girl",            // boy/girl/other
    grade: "2nd",              // Current grade
    date_of_birth: "2017-03-15" // YYYY-MM-DD
}
```

## Error Handling
```javascript
const child = getSelectedChild();
if (!child) {
    alert('Please select a child first');
    window.location.href = 'children-profiles.html';
    return;
}
// Continue with child data...
```

## Files
- **Component**: `/home/sabari/kumon-claude/profile-selector.js`
- **Usage Guide**: `/home/sabari/kumon-claude/PROFILE_SELECTOR_USAGE.md`
- **Summary**: `/home/sabari/kumon-claude/PROFILE_SELECTOR_SUMMARY.md`
- **Quick Ref**: `/home/sabari/kumon-claude/PROFILE_SELECTOR_QUICK_REF.md` (this file)
