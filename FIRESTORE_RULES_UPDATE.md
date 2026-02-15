# 🔥 Firestore Rules Update - Fix "Error loading profiles"

## Problem
Existing users are seeing "Error loading profiles" because the Firestore security rules don't include permissions for the `children` collection.

## Solution
Update your Firestore security rules to allow parents to access their children's profiles.

---

## Steps to Update Firestore Rules

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2. Select Your Project
Click on your project (e.g., "worksheets-app")

### 3. Navigate to Firestore Rules
1. In the left sidebar, click **"Firestore Database"**
2. Click the **"Rules"** tab at the top

### 4. Replace the Rules
Copy the entire content from `firestore.rules` file and paste it into the rules editor.

Or copy this directly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function to check if user is the parent of the child
    function isParent(parentUid) {
      return isAuthenticated() && request.auth.uid == parentUid;
    }

    // Users collection - authenticated users can read, only admins can write
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Worksheets collection - users can only access their own
    match /worksheets/{worksheetId} {
      allow read, write: if isAuthenticated() &&
                           resource.data.username == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.username;
      allow create: if isAuthenticated();
    }

    // Children collection - parents can read/write their own children's profiles
    match /children/{childId} {
      // Allow parents to read their own children
      allow read: if isAuthenticated() &&
                    resource.data.parent_uid == request.auth.uid;

      // Allow parents to create children under their account
      allow create: if isAuthenticated() &&
                      request.resource.data.parent_uid == request.auth.uid;

      // Allow parents to update/delete their own children
      allow update, delete: if isAuthenticated() &&
                              resource.data.parent_uid == request.auth.uid;

      // Allow admins to read all children
      allow read: if isAdmin();
    }

    // Child sessions collection - for single-device enforcement
    match /child_sessions/{sessionId} {
      // Allow parents to read/write sessions for their children
      allow read, write: if isAuthenticated();

      // Auto-delete old sessions (handled by client-side cleanup)
      allow delete: if isAuthenticated();
    }
  }
}
```

### 5. Publish the Rules
Click the blue **"Publish"** button

### 6. Test
1. Refresh your app in the browser
2. Login as an existing user
3. The "Error loading profiles" should now be gone
4. You should be redirected to create a child profile if you don't have any

---

## What These Rules Do

### ✅ Children Collection
- **Parents** can create, read, update, and delete their own children's profiles
- **Admins** can read all children (for support purposes)
- **Security**: Each parent can only access children where `parent_uid` matches their user ID

### ✅ Child Sessions Collection
- **All authenticated users** can manage sessions (for single-device enforcement)
- Sessions prevent multiple devices from using the same child account simultaneously

### ✅ Users Collection
- **All authenticated users** can read user data
- **Only admins** can create/update/delete users

### ✅ Worksheets Collection
- **Users** can only access their own worksheets
- Based on username matching

---

## Verify the Fix

After updating the rules:

1. **Check browser console** (F12) - Should see no more "permission-denied" errors
2. **Existing users** - Should redirect to children profile creation
3. **Users with children** - Should see profile selector working correctly

---

## Troubleshooting

### Still seeing errors?
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Check Firebase console**: Make sure rules were published
3. **Wait 1-2 minutes**: Rules take a moment to propagate
4. **Check console logs**: Look for specific error messages

### Rules won't publish?
- Make sure there are no syntax errors (Firebase will show them)
- The rules editor will highlight any problems in red

---

## Questions?
If you're still experiencing issues after updating the rules, check the browser console (F12) for specific error messages and share them.
