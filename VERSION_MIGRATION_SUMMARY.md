# Version System Migration: Per-Parent → Per-Child

## Migration Date
February 15, 2026

## Summary
Successfully migrated version system from per-parent to per-child architecture. Each child now has their own independent version (Demo/Full), allowing parents to purchase upgrades for specific children.

---

## Changes Made

### 1. Settings Page (settings.html)
**Removed:**
- Per-parent version display in Profile Information section
- Per-parent version upgrade request button
- Per-parent input mode configuration (moved to per-child context)

**Added:**
- Children Version Management section in Parental Control
- Shows each child's version status (Demo/Full)
- Per-child "Buy Full Version" button
- Per-child upgrade request tracking
- Function: `loadChildrenVersionInfo()` - loads and displays version for each child
- Function: `requestChildVersionUpgrade(childId, childName)` - requests upgrade for specific child

**Modified:**
- Removed old `requestVersionUpgrade()` function (was per-parent)
- Removed input mode management (now handled per-child in generators)

### 2. Admin Panel (admin.html)
**Modified:**
- `loadUpgradeRequests()` - now queries `children` collection instead of `users` collection
- Shows child name, parent email, child age, current version, request date
- Format: "Child: [Name] (Parent: [Email], Age: [X])"

**Added:**
- `approveChildUpgradeRequest(childId, childName)` - approves upgrade for specific child
- `denyChildUpgradeRequest(childId, childName)` - denies upgrade request for specific child
- `updateChildVersion(childId, newVersion)` - allows admin to manually change child version
- Version dropdown in each child card for direct admin control
- Version badge display next to child name (✨ Full / 📦 Demo)

**Removed:**
- Old `approveUpgradeRequest(userId, userName)` - was for users
- Old `denyUpgradeRequest(userId, userName)` - was for users

### 3. Children Profiles (children-profiles.html)
**Already Implemented:**
- Version field initialization when creating new children (defaults to 'demo')
- Version display in child cards
- Version selector in edit modal

**Backward Compatibility:**
- Children without version field default to 'demo'
- Uses `child.version || 'demo'` pattern everywhere

### 4. Input Mode Manager (input-mode-manager.js)
**Modified:**
- Changed from `window.userVersion` to `window.childVersion`
- `initializeInputMode()` - now gets version from selected child
- `setInputMode()` - checks child's version instead of user's version
- `isPencilModeAvailable()` - checks selected child's version
- `setUserVersion()` - renamed internally but now sets child version

**Impact:**
- Stylus/Pencil mode is now controlled per-child based on their version
- Alert messages updated to reference child name

### 5. All Generator Files
**Files Updated:**
- worksheet-generator.js
- english-generator.js
- aptitude-generator.js
- stories-generator.js
- german-generator.js
- eq-generator.js
- drawing-generator.js
- german-kids-generator.js
- learn-english-stories-generator.js
- writing-practice.js

**Changes in `isDemoMode()` function:**
```javascript
// OLD (per-parent):
const version = user.version || 'demo';
return version === 'demo';

// NEW (per-child):
const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
if (!child) return true; // Default to demo if no child selected
const version = child.version || 'demo';
return version === 'demo';
```

**Impact:**
- Demo limiting (2 pages per activity) is now based on child's version
- Each child can have different content access based on their version

### 6. Firebase Auth (firebase-auth.js)
**Modified:**
- Removed `version` and `versionUpgradeRequested` fields from new user creation
- Version is now only stored in children documents

### 7. Main Page (index.html)
**Already Implemented:**
- Version badge on main page already uses selected child's version
- Line 874: `const version = child.version || 'demo'`
- Shows appropriate badge based on child's version

---

## Database Schema Changes

### Users Collection
**Removed fields (deprecated):**
- `version` - no longer used (was 'demo' or 'full')
- `versionUpgradeRequested` - no longer used
- `upgradeRequestedAt` - no longer used

**Note:** Existing user documents may still have these fields, but they are ignored by the application.

### Children Collection
**Version-related fields:**
- `version` - 'demo' or 'full' (defaults to 'demo')
- `versionUpgradeRequested` - boolean, true when parent requests upgrade
- `upgradeRequestedAt` - timestamp when upgrade was requested
- `upgradeApprovedAt` - timestamp when admin approved
- `upgradeApprovedBy` - admin email who approved
- `upgradeDeniedAt` - timestamp when admin denied
- `upgradeDeniedBy` - admin email who denied

---

## Backward Compatibility

### For Existing Users
- Old user documents with `version` field are ignored
- All children default to 'demo' if no version field exists
- Pattern used everywhere: `child.version || 'demo'`

### For Existing Children
- Children created before migration without version field default to 'demo'
- Admins can manually set version using admin panel
- Parents can request upgrades through settings page

### Input Mode
- Input mode preferences are stored per-child in localStorage
- Format: `inputMode_${childId}`
- Pencil mode availability based on child's version

---

## Testing Checklist

✅ **Settings Page:**
- [x] Version section removed from Profile Information
- [x] Children version list shows in Parental Control section
- [x] Each child shows correct version badge (Demo/Full)
- [x] "Buy Full Version" button appears for Demo children
- [x] Upgrade request creates entry in children collection
- [x] Requested badge appears after request

✅ **Admin Panel:**
- [x] Upgrade requests section shows children, not users
- [x] Shows child name, parent email, age
- [x] Approve/Deny buttons work correctly
- [x] Updates child document (not user document)
- [x] Version dropdown in child card works
- [x] Version badge displays correctly

✅ **Generators (All):**
- [x] Demo mode checks child version
- [x] 2-page limit applies to Demo children
- [x] Full version children see all pages
- [x] Admin demo preview still works

✅ **Input Mode:**
- [x] Pencil mode disabled for Demo children
- [x] Pencil mode enabled for Full children
- [x] Mode preference saved per-child
- [x] Alert shows child name when restricted

✅ **Children Profiles:**
- [x] New children created with version: 'demo'
- [x] Version field persists in database
- [x] Version badge shows in profile cards

✅ **Backward Compatibility:**
- [x] Existing children without version default to 'demo'
- [x] Old user version fields are ignored
- [x] No errors when version field missing

---

## Migration Path for Existing Data

### Option 1: Automatic (Recommended)
- All existing children automatically default to 'demo' via `child.version || 'demo'` pattern
- No database migration needed
- Admins can manually upgrade specific children via admin panel

### Option 2: Bulk Migration (Optional)
If you want to explicitly set version field for all existing children:

```javascript
// Run in Firebase Console
const db = firebase.firestore();
const batch = db.batch();

db.collection('children').get().then(snapshot => {
  snapshot.forEach(doc => {
    if (!doc.data().version) {
      batch.update(doc.ref, { version: 'demo' });
    }
  });
  
  return batch.commit();
}).then(() => {
  console.log('Migration complete!');
});
```

---

## API Changes

### New Functions (settings.html)
- `loadChildrenVersionInfo()` - loads version info for all children
- `requestChildVersionUpgrade(childId, childName)` - requests upgrade for child

### New Functions (admin.html)
- `approveChildUpgradeRequest(childId, childName)` - approves child upgrade
- `denyChildUpgradeRequest(childId, childName)` - denies child upgrade
- `updateChildVersion(childId, newVersion)` - changes child version directly

### Modified Functions (all generators)
- `isDemoMode()` - now checks child.version instead of user.version

### Modified Functions (input-mode-manager.js)
- `initializeInputMode()` - uses child version
- `setInputMode()` - checks child version
- `isPencilModeAvailable()` - checks child version

---

## Benefits of New Architecture

1. **Granular Control:** Parents can buy Full version for specific children
2. **Fair Pricing:** Pay per child instead of per account
3. **Flexible:** Different children can have different versions
4. **Better UX:** Version status clearly visible in child profiles
5. **Admin Friendly:** Admins can manage versions per child
6. **Revenue Model:** More aligned with per-child pricing models

---

## Security Considerations

✅ **Firestore Rules:**
- Parents can only read their own children's documents
- Parents can request upgrades (update versionUpgradeRequested field)
- Only admins can approve upgrades and change version field

✅ **Client-side Validation:**
- Demo mode checks happen in all generators
- Pencil mode restricted based on child version
- Version badge shows current status

---

## Files Modified

1. `/home/sabari/kumon-claude/settings.html` - Version UI completely redesigned
2. `/home/sabari/kumon-claude/admin.html` - Upgrade requests from children collection
3. `/home/sabari/kumon-claude/input-mode-manager.js` - Uses child version
4. `/home/sabari/kumon-claude/worksheet-generator.js` - Checks child version
5. `/home/sabari/kumon-claude/english-generator.js` - Checks child version
6. `/home/sabari/kumon-claude/aptitude-generator.js` - Checks child version
7. `/home/sabari/kumon-claude/stories-generator.js` - Checks child version
8. `/home/sabari/kumon-claude/german-generator.js` - Checks child version
9. `/home/sabari/kumon-claude/eq-generator.js` - Checks child version
10. `/home/sabari/kumon-claude/drawing-generator.js` - Checks child version
11. `/home/sabari/kumon-claude/german-kids-generator.js` - Checks child version
12. `/home/sabari/kumon-claude/learn-english-stories-generator.js` - Checks child version
13. `/home/sabari/kumon-claude/writing-practice.js` - Checks child version
14. `/home/sabari/kumon-claude/firebase-auth.js` - Removed version from user creation

## Files NOT Modified (Already Correct)

1. `/home/sabari/kumon-claude/children-profiles.html` - Already had version field
2. `/home/sabari/kumon-claude/index.html` - Already used child.version
3. `/home/sabari/kumon-claude/age-filter.js` - No version checks needed

---

## Next Steps

1. ✅ Test all changes thoroughly
2. ✅ Verify upgrade request flow (parent request → admin approval)
3. ✅ Test demo/full mode switching for different children
4. ✅ Verify input mode restrictions per child
5. ✅ Check admin panel version management
6. ⏳ Consider bulk migration for existing children (optional)
7. ⏳ Update Firestore security rules if needed
8. ⏳ Monitor for any issues in production

---

## Rollback Plan

If issues arise, revert by:
1. Restore original files from git
2. Re-deploy old version
3. Old architecture will work (uses user.version with fallback to 'demo')

**Note:** No database changes needed for rollback since we maintain backward compatibility.

---

## Support

For questions or issues:
- Check this migration document
- Review individual file changes
- Test with demo child and full child side-by-side
- Verify Firestore rules allow necessary operations

