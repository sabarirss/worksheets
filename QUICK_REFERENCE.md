# Version System Quick Reference

## Overview
Version (Demo/Full) is now stored **per-child** in the `children` collection, not per-parent in `users` collection.

---

## Where Version is Checked

### 1. Settings Page
**Location:** `/home/sabari/kumon-claude/settings.html`
- Shows each child's version with upgrade button
- Parent can request upgrade for specific child
- Function: `loadChildrenVersionInfo()`

### 2. Admin Panel
**Location:** `/home/sabari/kumon-claude/admin.html`
- Lists upgrade requests from children
- Admin can approve/deny per child
- Admin can directly change child version with dropdown
- Functions: `approveChildUpgradeRequest()`, `denyChildUpgradeRequest()`, `updateChildVersion()`

### 3. All Generators (Demo Mode)
**Locations:** All *-generator.js files
- Function: `isDemoMode()` checks `child.version`
- Returns true if child has demo version
- Limits content to 2 pages for demo children

### 4. Input Mode Manager
**Location:** `/home/sabari/kumon-claude/input-mode-manager.js`
- Pencil mode only available for Full version children
- Checks `child.version` before allowing pencil mode
- Alert mentions child name if restricted

### 5. Main Page (index.html)
**Location:** `/home/sabari/kumon-claude/index.html`
- Version badge shows selected child's version
- Already implemented correctly (line 874)

---

## Code Patterns

### Getting Child Version
```javascript
const child = getSelectedChild();
if (!child) return true; // Default to demo

const version = child.version || 'demo'; // Backward compatible
```

### Checking Demo Mode
```javascript
function isDemoMode() {
    const user = getCurrentUser();
    if (!user) return true;

    // Admin demo preview
    if (user.role === 'admin') {
        const adminDemoPreview = localStorage.getItem('adminDemoPreview') === 'true';
        return adminDemoPreview;
    }

    // Check child version
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return true;

    const version = child.version || 'demo';
    return version === 'demo';
}
```

### Version Badge Display
```javascript
const versionBadge = version === 'full'
    ? '<span style="background: #4caf50; color: white;">✨ Full</span>'
    : '<span style="background: #ff9800; color: white;">📦 Demo</span>';
```

---

## Database Fields

### Children Collection
```javascript
{
  version: 'demo' | 'full',                    // Current version
  versionUpgradeRequested: true | false,       // Upgrade request pending
  upgradeRequestedAt: Timestamp,               // When requested
  upgradeApprovedAt: Timestamp,                // When approved
  upgradeApprovedBy: 'admin@email.com',       // Who approved
  upgradeDeniedAt: Timestamp,                  // When denied (if applicable)
  upgradeDeniedBy: 'admin@email.com'          // Who denied
}
```

### Users Collection (Deprecated Fields)
```javascript
{
  // These fields are NO LONGER USED:
  version: 'demo',                  // IGNORE
  versionUpgradeRequested: false,   // IGNORE
  upgradeRequestedAt: Timestamp     // IGNORE
}
```

---

## Common Operations

### Parent: Request Upgrade
1. Go to Settings → Parental Control → Version Management
2. Click "Buy Full Version" for specific child
3. Request saved in child document

### Admin: Approve Upgrade
1. Go to Admin Panel → Version Upgrade Requests section
2. Review child request (shows child name, parent email, age)
3. Click "✓ Approve"
4. Child's version updated to 'full'

### Admin: Manually Change Version
1. Go to Admin Panel → Expand parent row
2. Find child card
3. Use version dropdown to change Demo ↔ Full
4. Saves immediately

---

## Troubleshooting

### Issue: Child still shows demo even after upgrade
**Solution:** Refresh page or re-select child profile

### Issue: Pencil mode not working for full version child
**Solution:** 
1. Check child.version === 'full'
2. Clear localStorage for that child: `localStorage.removeItem('inputMode_${childId}')`
3. Re-initialize input mode

### Issue: Upgrade request not showing in admin panel
**Solution:**
1. Check Firestore: children collection → find child → check `versionUpgradeRequested: true`
2. Refresh admin panel
3. Check browser console for errors

### Issue: Demo limiting not working
**Solution:**
1. Verify `isDemoMode()` function updated in generator
2. Check that child is selected: `getSelectedChild()`
3. Verify child.version field exists or defaults to 'demo'

---

## Testing Commands

### Check if child has version
```javascript
const child = getSelectedChild();
console.log('Child version:', child.version || 'demo');
```

### Test demo mode
```javascript
console.log('Is demo mode:', isDemoMode());
```

### Check pencil availability
```javascript
console.log('Pencil available:', isPencilModeAvailable());
```

### List all children with versions
```javascript
firebase.firestore().collection('children')
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`${data.name}: ${data.version || 'demo'}`);
    });
  });
```

---

## Key Files Summary

| File | Purpose | Key Changes |
|------|---------|-------------|
| settings.html | Parent UI | Per-child version display & request |
| admin.html | Admin UI | Child upgrade requests & approval |
| input-mode-manager.js | Pencil mode | Uses child.version |
| *-generator.js (all) | Demo limiting | isDemoMode() uses child.version |
| children-profiles.html | Child creation | Initializes version: 'demo' |
| firebase-auth.js | User creation | Removed version field |
| index.html | Main page | Already uses child.version ✓ |

---

## Important Notes

1. **Always use:** `child.version || 'demo'` for backward compatibility
2. **Admin Demo Preview:** Still works via localStorage, separate from child version
3. **No Database Migration Needed:** Defaults handle missing version fields
4. **Security:** Only admins can approve upgrades and change versions
5. **Per-Child Storage:** Input mode preferences stored as `inputMode_${childId}`

---

## Next Actions

✅ **For Developers:**
- Review this guide before making version-related changes
- Use the code patterns shown above
- Test with both demo and full version children

✅ **For Admins:**
- Monitor upgrade requests in admin panel
- Use version dropdown for quick changes
- Check children without version field (will show as demo)

✅ **For Testing:**
- Create test children with demo and full versions
- Verify upgrade request flow end-to-end
- Test pencil mode restrictions
- Verify demo limiting (2 pages)

