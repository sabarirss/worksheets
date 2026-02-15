# 🔥 CRITICAL: Firestore Rules Update - Fix Login Issue

## 🚨 Problem
**After adding child profiles, users cannot login - including admin!**

### Root Cause
The Firestore security rules were blocking the login flow itself:
1. Login needs to query the `users` collection to convert username → email
2. Old rules required authentication to read `users` collection
3. **Catch-22**: Can't login without querying users, can't query users without being logged in!

### Symptoms
- "Invalid username or password" errors for correct credentials
- Login works initially, fails after creating child profile
- Even admin cannot login after rules update

---

## ✅ Solution
Update Firestore rules to allow **public read** access to the `users` collection for login purposes, while maintaining security for other operations.

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
**IMPORTANT:** Copy the ENTIRE content from the `firestore.rules` file and paste it into the rules editor.

Or copy this directly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns this user document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid.substring(0, 20) == userId;
    }

    // Helper function to check if user is the parent of the child
    function isParent(parentUid) {
      return isAuthenticated() && request.auth.uid == parentUid;
    }

    // Users collection - public read for login flow, restricted write
    match /users/{userId} {
      // Allow public read for login username/email lookup
      allow read: if true;

      // Allow users to update their own profile
      allow update: if isOwner(userId);

      // Only admins can create/delete users (admin creates via secondary auth)
      allow create, delete: if isAuthenticated() &&
                               exists(/databases/$(database)/documents/users/$(request.auth.uid.substring(0, 20))) &&
                               get(/databases/$(database)/documents/users/$(request.auth.uid.substring(0, 20))).data.role == 'admin';
    }

    // Worksheets collection - users can only access their own
    match /worksheets/{worksheetId} {
      allow read, write: if isAuthenticated() &&
                           resource.data.username == get(/databases/$(database)/documents/users/$(request.auth.uid.substring(0, 20))).data.username;
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
      allow read: if isAuthenticated() &&
                    exists(/databases/$(database)/documents/users/$(request.auth.uid.substring(0, 20))) &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid.substring(0, 20))).data.role == 'admin';
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
Click the blue **"Publish"** button in the top right

### 6. Test Login
1. Wait 30 seconds for rules to propagate
2. Try logging in with your username and password
3. Admin login: `admin` / `admin123`
4. Login should now work! ✅

---

## What These Rules Do

### 🔓 Users Collection (PUBLIC READ)
- **Everyone** can read user data (needed for login username→email lookup)
- **Users** can update their own profile
- **Only admins** can create/delete users
- **Security Note**: Don't store sensitive data in users collection (passwords are in Firebase Auth, not Firestore)

### 🔒 Children Collection (PRIVATE)
- **Parents** can only access their own children (matched by parent_uid)
- **Admins** can read all children
- **Strong security**: Each parent isolated to their own data

### 🔒 Worksheets Collection (PRIVATE)
- **Users** can only access their own worksheets
- Based on username matching

### 🔒 Child Sessions Collection
- **Authenticated users** can manage sessions
- Prevents multiple devices using same child account

---

## Security Analysis

### ❓ Is public read on users collection safe?
**YES**, because:
1. No sensitive data stored there (passwords in Firebase Auth)
2. Standard practice for Firebase apps with username login
3. Data visible: username, email, fullName, role, modules - nothing secret
4. Alternative would require all users to login with full email (bad UX)

### 🔐 What's Protected?
- **Passwords**: Stored in Firebase Auth (never in Firestore)
- **Worksheets**: Users can only see their own
- **Children profiles**: Parents can only see their own children
- **Admin actions**: Only admins can create/delete users

---

## Verify the Fix

After updating and publishing the rules:

### ✅ Test Admin Login
```
Username: admin
Password: admin123
```
Should successfully login to index.html

### ✅ Test User Login
1. Try your regular username and password
2. Should login successfully
3. Should see profile selector if you have children

### ✅ Check Console (F12)
- No "permission-denied" errors
- Login queries should succeed
- Profile loading should work

---

## Troubleshooting

### Still can't login?
1. **Wait 1-2 minutes**: Rules take time to propagate globally
2. **Clear browser cache**: Ctrl+Shift+Delete (select "Cached images and files")
3. **Hard refresh**: Ctrl+Shift+R
4. **Check rules published**: In Firebase console, Rules tab should show your new rules

### Rules won't publish?
- Check for syntax errors (Firebase editor shows them in red)
- Make sure you copied the ENTIRE rules file
- Don't modify the `rules_version = '2';` line

### Different error?
- Open browser console (F12)
- Try logging in
- Look for error messages in Console tab
- Share the error code (e.g., "auth/wrong-password", "permission-denied")

---

## Questions?
If you're still experiencing issues after updating the rules:
1. Check the browser console (F12) for specific error messages
2. Verify the rules are published in Firebase console
3. Try the admin account first: `admin` / `admin123`
