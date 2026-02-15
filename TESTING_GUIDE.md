# Complete Testing Guide - Child Profile System
**Date:** 2026-02-15
**Status:** All features implemented, ready for validation

---

## Prerequisites

### Setup Required
1. ✅ Firebase project configured (firebase-config.js)
2. ✅ Firestore database enabled with collections:
   - `users`
   - `children`
   - `child_sessions`
   - `worksheets`
3. ✅ Firebase Authentication enabled (Email/Password)

### Test Accounts Needed
- 1 Parent account (create via signup.html)
- 2-3 Child profiles (different ages: 6, 8, 12)
- 2 devices or browsers for session testing

---

## Test Suite 1: Profile Persistence (Priority 1)

### Test 1.1: LocalStorage Persistence
**Objective:** Verify child selection persists across browser sessions

**Steps:**
1. Login as parent
2. Select a child from dropdown (e.g., "Emma, Age 7")
3. Navigate to Math module
4. Close browser completely (not just tab)
5. Reopen browser and navigate to the application
6. Login as the same parent

**Expected Result:**
- ✅ Emma should still be selected in profile dropdown
- ✅ Emma's name should appear in any generated worksheets
- ✅ Console log should show: "Selected child: Emma"

**How to Verify:**
```javascript
// Open browser console (F12) and run:
localStorage.getItem('selectedChild')
// Should return: {"id":"abc123","name":"Emma","age":7,...}
```

**Pass/Fail:** ___________

---

### Test 1.2: Profile Switching
**Objective:** Verify switching between children works correctly

**Steps:**
1. Login as parent with 2+ children
2. Note currently selected child (Child A)
3. Click profile dropdown
4. Select different child (Child B)
5. Navigate to English module
6. Generate a worksheet

**Expected Result:**
- ✅ Dropdown now shows Child B's name and avatar
- ✅ Worksheet header shows Child B's name
- ✅ Selection persists after page navigation
- ✅ localStorage updated with Child B's data

**Pass/Fail:** ___________

---

## Test Suite 2: Age-Based Filtering (Priority 1)

### Test 2.1: Age 6 Content Filtering
**Objective:** Verify 6-year-old sees appropriate content

**Steps:**
1. Create child profile: Name="Alex", Age=6
2. Select Alex from dropdown
3. Navigate to main dashboard (index.html)
4. Observe visible modules

**Expected Result:**
- ✅ Math: Only shows 6A and 5A levels (NOT 4A, 3A, 2A)
- ✅ English: Only shows Easy and Medium (NOT Hard)
- ✅ German B1: Hidden (age 10+ only)
- ✅ Emotional Quotient: Hidden (age 7+ only)
- ✅ German Kids: Visible (age 6+)
- ✅ Stories: Only Easy difficulty visible

**Console Verification:**
```javascript
// Open console and run:
getUserAge()
// Should return: 6

getAgeGroup(6)
// Should return: "easy"

getMinLevel(6)
// Should return: 5
```

**Pass/Fail:** ___________

---

### Test 2.2: Age 10 Content Filtering
**Objective:** Verify 10-year-old sees all content

**Steps:**
1. Create child profile: Name="Jordan", Age=10
2. Select Jordan from dropdown
3. Navigate to main dashboard
4. Navigate to Math module

**Expected Result:**
- ✅ Math: All levels visible (6A, 5A, 4A, 3A, 2A)
- ✅ English: All difficulties visible (Easy, Medium, Hard)
- ✅ German B1: Visible (age 10+)
- ✅ All other modules visible

**Pass/Fail:** ___________

---

### Test 2.3: Age 5 Content Filtering
**Objective:** Verify 5-year-old has most restrictive access

**Steps:**
1. Create child profile: Name="Luna", Age=5
2. Select Luna from dropdown
3. Navigate to main dashboard

**Expected Result:**
- ✅ Math: Only 6A level visible (easiest)
- ✅ English: Only Easy difficulty
- ✅ German B1: Hidden
- ✅ German Kids: Hidden (age 6+)
- ✅ Emotional Quotient: Hidden (age 7+)
- ✅ Stories: Only Easy difficulty

**Pass/Fail:** ___________

---

## Test Suite 3: Worksheet Name Display (Priority 1)

### Test 3.1: Drawing Module Name
**Objective:** Verify drawing worksheets show child's name

**Steps:**
1. Select a child (e.g., "Sam, Age 8")
2. Navigate to Drawing module
3. Select any tutorial (e.g., "Cat")
4. Draw something and save as PDF

**Expected Result:**
- ✅ Worksheet header shows: "👤 Name: Sam"
- ✅ NOT parent's name
- ✅ Age shown matches child's age: "📊 Age Group: 8"

**Visual Check:**
- Open saved PDF
- Look for "Student Info" section
- Name field should say "Sam"

**Pass/Fail:** ___________

---

### Test 3.2: EQ Module Name Auto-Populate
**Objective:** Verify EQ worksheets auto-populate child's name

**Steps:**
1. Select child "Maya, Age 9"
2. Navigate to Emotional Quotient module
3. Select any difficulty level
4. Click "Generate Worksheet"

**Expected Result:**
- ✅ Name input field pre-filled with "Maya"
- ✅ Field is editable (can still change if needed)
- ✅ PDF shows "Maya" when saved

**Console Verification:**
```javascript
document.getElementById('student-name').value
// Should return: "Maya"
```

**Pass/Fail:** ___________

---

### Test 3.3: No Child Selected Fallback
**Objective:** Verify graceful fallback when no child selected

**Steps:**
1. Login as parent
2. Open browser console
3. Run: `localStorage.removeItem('selectedChild')`
4. Reload page
5. Navigate to Drawing module

**Expected Result:**
- ✅ Profile selector shows "Add Child Profile" button
- ✅ Worksheet shows parent's name instead
- ✅ No JavaScript errors in console

**Pass/Fail:** ___________

---

## Test Suite 4: Security Features (Priority 1)

### Test 4.1: Logout Clears Child Data
**Objective:** Verify child data removed on logout

**Steps:**
1. Login as parent
2. Select child "Zoe, Age 7"
3. Open browser console
4. Verify child data exists: `localStorage.getItem('selectedChild')`
5. Click logout button
6. Check console again: `localStorage.getItem('selectedChild')`

**Expected Result:**
- ✅ Before logout: Returns Zoe's data object
- ✅ After logout: Returns `null`
- ✅ Redirects to login.html
- ✅ SessionStorage also cleared

**Console Commands:**
```javascript
// After logout:
localStorage.getItem('selectedChild')        // Should be null
localStorage.getItem('selectedChildId')      // Should be null
localStorage.getItem('childSessionId')       // Should be null
```

**Pass/Fail:** ___________

---

### Test 4.2: Single Session Enforcement (Device 1 → Device 2)
**Objective:** Verify only one device can be logged into a child profile

**Setup:**
- Device 1: Chrome browser
- Device 2: Firefox or Chrome Incognito
- Both connected to internet

**Steps:**
1. **Device 1:** Login as parent, select child "Leo, Age 6"
2. **Device 1:** Navigate to Math module (stay on this page)
3. **Device 2:** Login as same parent
4. **Device 2:** Select same child "Leo, Age 6"
5. **Device 1:** Wait 2-3 seconds, observe what happens

**Expected Result:**
- ✅ Device 1: Alert appears: "This child profile is now active on another device. You have been logged out."
- ✅ Device 1: Automatically redirects to index.html
- ✅ Device 1: Child selection cleared
- ✅ Device 2: Remains logged in normally
- ✅ No errors in either console

**Firestore Verification:**
```javascript
// In Device 2 console:
firebase.firestore().collection('child_sessions').doc('LEO_CHILD_ID').get()
  .then(doc => console.log(doc.data()))
// Should show session_id from Device 2
```

**Pass/Fail:** ___________

---

### Test 4.3: Session Activity Heartbeat
**Objective:** Verify session stays active with periodic updates

**Steps:**
1. Login as parent, select child
2. Open browser console
3. Monitor Firestore `child_sessions` collection
4. Wait 6 minutes while actively using the app

**Expected Result:**
- ✅ `last_active` timestamp updates every 5 minutes
- ✅ Session remains valid
- ✅ No logout occurs

**Firestore Check:**
```javascript
// Check last_active field updates
firebase.firestore().collection('child_sessions')
  .doc('CHILD_ID').onSnapshot(doc => {
    console.log('Last active:', doc.data().last_active.toDate())
  })
```

**Pass/Fail:** ___________

---

## Test Suite 5: First-Time Parent Flow (Priority 2)

### Test 5.1: New Parent Redirect
**Objective:** Verify new parents redirected to create child profile

**Steps:**
1. Create new parent account via signup.html
   - Username: testparent2
   - Email: testparent2@example.com
   - Password: test123
2. Verify email and login
3. Observe redirect behavior

**Expected Result:**
- ✅ Automatically redirects to children-profiles.html
- ✅ Welcome modal appears with message: "Welcome! Please create your first child profile to begin."
- ✅ Modal has "Create First Profile" button
- ✅ SessionStorage flag set: `sessionStorage.getItem('firstTimeSetup') === 'true'`

**Pass/Fail:** ___________

---

### Test 5.2: Welcome Message Display
**Objective:** Verify welcome message shows and dismisses correctly

**Steps:**
1. Continue from Test 5.1
2. Click "Create First Profile" button
3. Fill in child details
4. Save profile
5. Reload children-profiles.html

**Expected Result:**
- ✅ Modal disappears after clicking button
- ✅ Child creation form appears
- ✅ Welcome message does NOT reappear on subsequent visits
- ✅ SessionStorage flag removed after first display

**Pass/Fail:** ___________

---

### Test 5.3: Existing Parent (Has Children)
**Objective:** Verify existing parents NOT redirected

**Steps:**
1. Login as parent who already has children
2. Observe behavior

**Expected Result:**
- ✅ NO redirect to children-profiles.html
- ✅ Goes directly to dashboard (index.html)
- ✅ Profile selector shows existing children
- ✅ No welcome message

**Pass/Fail:** ___________

---

## Test Suite 6: Parent Signup (Priority 2)

### Test 6.1: Parent Signup No Age Field
**Objective:** Verify parent signup does NOT ask for age

**Steps:**
1. Navigate to signup.html
2. Observe form fields

**Expected Result:**
- ✅ Fields present: Full Name, Username, Email, Password, Confirm Password
- ✅ NO age dropdown or input field
- ✅ Parent/Guardian notice displayed
- ✅ Terms checkbox required

**Visual Check:**
- Inspect form HTML
- Count input fields (should be 5: name, username, email, password, confirm)
- NO age-related fields

**Pass/Fail:** ___________

---

### Test 6.2: Parent Account Creation
**Objective:** Verify parent account created without age

**Steps:**
1. Fill out signup form
2. Submit and verify email
3. Login to Firebase Console
4. Check Firestore `users` collection
5. Find the newly created user document

**Expected Result:**
- ✅ Document has: username, email, fullName, role='parent'
- ✅ Document does NOT have: age field
- ✅ modules.math = true (only math enabled by default)
- ✅ version = 'demo'

**Firestore Check:**
```javascript
firebase.firestore().collection('users')
  .where('username', '==', 'YOUR_USERNAME')
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log('Has age field:', 'age' in doc.data())
      // Should be false
    })
  })
```

**Pass/Fail:** ___________

---

## Test Suite 7: Mobile Responsiveness (Priority 3)

### Test 7.1: Mobile Layout (480px)
**Objective:** Verify UI works on mobile devices

**Steps:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" or set width to 375px
4. Login and navigate through pages

**Expected Result:**
- ✅ Profile selector takes full width
- ✅ Dropdown doesn't overflow screen
- ✅ Touch targets large enough (minimum 44x44px)
- ✅ No horizontal scrolling
- ✅ All buttons accessible

**Pages to Test:**
- index.html
- math module
- drawing module
- children-profiles.html

**Pass/Fail:** ___________

---

### Test 7.2: Tablet Layout (768px)
**Objective:** Verify UI works on tablets

**Steps:**
1. Set device width to 768px (iPad)
2. Test all pages

**Expected Result:**
- ✅ Profile selector properly positioned
- ✅ Dropdown displays correctly
- ✅ Worksheet generators responsive
- ✅ No overlapping elements

**Pass/Fail:** ___________

---

## Test Suite 8: Edge Cases (Priority 3)

### Test 8.1: Parent with No Children (Manual Bypass)
**Objective:** Test behavior when children deleted

**Steps:**
1. Login as parent with children
2. Go to children-profiles.html
3. Delete all children
4. Return to index.html

**Expected Result:**
- ✅ Profile selector shows "Add Child Profile" button
- ✅ Worksheets fallback to parent's name
- ✅ No JavaScript errors
- ✅ Can still access modules

**Pass/Fail:** ___________

---

### Test 8.2: Rapid Profile Switching
**Objective:** Test switching between children quickly

**Steps:**
1. Login as parent with 3+ children
2. Click profile dropdown
3. Select Child A
4. Immediately click dropdown again
5. Select Child B
6. Repeat 5 times rapidly

**Expected Result:**
- ✅ No JavaScript errors
- ✅ Final selection is correct
- ✅ localStorage updated correctly
- ✅ UI shows correct child

**Pass/Fail:** ___________

---

### Test 8.3: Network Failure During Session Creation
**Objective:** Test graceful degradation on network issues

**Steps:**
1. Login as parent
2. Open Chrome DevTools → Network tab
3. Set throttling to "Offline"
4. Try to select a child
5. Re-enable network
6. Select child again

**Expected Result:**
- ✅ No page crash
- ✅ Error logged to console (acceptable)
- ✅ Works correctly when network restored
- ✅ User can retry

**Pass/Fail:** ___________

---

## Test Suite 9: Browser Compatibility (Priority 3)

### Test 9.1: Chrome
**Expected:** ✅ Full functionality

**Pass/Fail:** ___________

---

### Test 9.2: Firefox
**Expected:** ✅ Full functionality

**Pass/Fail:** ___________

---

### Test 9.3: Safari (if available)
**Expected:** ✅ Full functionality

**Pass/Fail:** ___________

---

### Test 9.4: Edge
**Expected:** ✅ Full functionality

**Pass/Fail:** ___________

---

## Test Suite 10: Console Error Check

### Test 10.1: Error-Free Operation
**Objective:** Verify no JavaScript errors during normal use

**Steps:**
1. Open browser console (F12)
2. Clear console
3. Perform normal workflow:
   - Login
   - Select child
   - Navigate to 3 different modules
   - Generate 2 worksheets
   - Switch child
   - Logout

**Expected Result:**
- ✅ NO red error messages in console
- ✅ Only info/log messages (blue/gray)
- ✅ No 404 errors in Network tab
- ✅ All scripts load successfully

**Acceptable Warnings:**
- Firebase initialization messages
- Deprecation warnings (not errors)

**Pass/Fail:** ___________

---

## Summary Report Template

```
┌─────────────────────────────────────────────────────────────┐
│               TESTING SUMMARY REPORT                        │
├─────────────────────────────────────────────────────────────┤
│ Date: _______________                                       │
│ Tester: _____________                                       │
│                                                             │
│ TEST SUITE 1: Profile Persistence                          │
│   Test 1.1: LocalStorage Persistence        [ ] PASS [ ] FAIL │
│   Test 1.2: Profile Switching                [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 2: Age-Based Filtering                          │
│   Test 2.1: Age 6 Filtering                  [ ] PASS [ ] FAIL │
│   Test 2.2: Age 10 Filtering                 [ ] PASS [ ] FAIL │
│   Test 2.3: Age 5 Filtering                  [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 3: Worksheet Names                              │
│   Test 3.1: Drawing Module Name              [ ] PASS [ ] FAIL │
│   Test 3.2: EQ Module Auto-Populate          [ ] PASS [ ] FAIL │
│   Test 3.3: No Child Fallback                [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 4: Security                                      │
│   Test 4.1: Logout Clears Data               [ ] PASS [ ] FAIL │
│   Test 4.2: Single Session Enforcement       [ ] PASS [ ] FAIL │
│   Test 4.3: Session Heartbeat                [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 5: First-Time Flow                              │
│   Test 5.1: New Parent Redirect              [ ] PASS [ ] FAIL │
│   Test 5.2: Welcome Message                  [ ] PASS [ ] FAIL │
│   Test 5.3: Existing Parent                  [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 6: Parent Signup                                │
│   Test 6.1: No Age Field                     [ ] PASS [ ] FAIL │
│   Test 6.2: Account Creation                 [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 7: Mobile Responsive                            │
│   Test 7.1: Mobile 480px                     [ ] PASS [ ] FAIL │
│   Test 7.2: Tablet 768px                     [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 8: Edge Cases                                   │
│   Test 8.1: No Children                      [ ] PASS [ ] FAIL │
│   Test 8.2: Rapid Switching                  [ ] PASS [ ] FAIL │
│   Test 8.3: Network Failure                  [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 9: Browser Compatibility                        │
│   Test 9.1: Chrome                           [ ] PASS [ ] FAIL │
│   Test 9.2: Firefox                          [ ] PASS [ ] FAIL │
│   Test 9.3: Safari                           [ ] PASS [ ] FAIL │
│   Test 9.4: Edge                             [ ] PASS [ ] FAIL │
│                                                             │
│ TEST SUITE 10: Console Errors                              │
│   Test 10.1: Error-Free Operation            [ ] PASS [ ] FAIL │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ OVERALL STATUS:                                             │
│   Total Tests: 26                                           │
│   Passed: ____                                              │
│   Failed: ____                                              │
│   Pass Rate: ____%                                          │
│                                                             │
│ PRODUCTION READY: [ ] YES [ ] NO                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Debugging Tips

### Issue: Child not persisting after browser restart
**Check:**
```javascript
localStorage.getItem('selectedChild')  // Should have data
```
**Fix:** Verify profile-selector.js is loaded on all pages

---

### Issue: Wrong age content showing
**Check:**
```javascript
getUserAge()  // Should return child's age
getSelectedChild()  // Should return correct child
```
**Fix:** Ensure age-filter.js loads after profile-selector.js

---

### Issue: Session not logging out on second device
**Check:**
- Firestore rules allow read/write to child_sessions
- Both devices connected to internet
- Wait 2-3 seconds for real-time sync
**Fix:** Check Firebase console → Firestore → child_sessions

---

### Issue: Name not showing in worksheets
**Check:**
```javascript
getSelectedChild()  // Should return child object with name
```
**Fix:** Ensure getSelectedChild() defined globally in profile-selector.js

---

## Next Steps After Testing

1. ✅ Complete all Priority 1 tests (critical)
2. ✅ Complete Priority 2 tests (important)
3. ✅ Complete Priority 3 tests (nice-to-have)
4. Document any failures in issue tracker
5. Re-test failed cases after fixes
6. Get stakeholder approval
7. Deploy to production

---

**Testing Guide Version:** 1.0
**Last Updated:** 2026-02-15
**Status:** Ready for validation
