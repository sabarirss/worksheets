# 🔐 Authentication System Documentation

## Overview
A complete user authentication and authorization system has been implemented for the Practice Worksheets application. All content is now protected behind login, and worksheets are saved per-user.

---

## Features Implemented

### ✅ 1. Login System
- **Login Page:** `login.html` - Clean, modern login interface
- **Session Management:** 24-hour session timeout
- **Secure Storage:** User data stored in browser localStorage
- **Auto-redirect:** Already-logged-in users redirected to home page

### ✅ 2. User Management
- **Admin Panel:** `admin.html` - Full user CRUD operations
- **Role-Based Access:** Admin and Student roles
- **Module Permissions:** Granular control over module access per user
- **User Statistics:** Dashboard showing total users, admins, students

### ✅ 3. User-Specific Data
- **Worksheets:** All saved worksheets are per-user
- **Storage Keys:** Format: `worksheet_{username}_{subject}_{identifier}`
- **User Name Display:** Worksheets automatically use logged-in user's name
- **Data Isolation:** Users can only see their own saved worksheets

### ✅ 4. Module Access Control
- **Per-Module Permissions:** Each user can have different module access
- **Modules Available:**
  - 📐 Mathematics
  - 📚 English
  - 🧩 Aptitude
  - 📖 Stories
  - ❤️ Emotional Quotient
  - 🇩🇪 German

---

## Default Admin Account

**IMPORTANT:** Change this password after first login!

```
Username: admin
Password: admin123
```

### Admin Capabilities
- ✅ Access all modules
- ✅ Create new users
- ✅ Edit existing users
- ✅ Delete users (except admin)
- ✅ Control module access for each user
- ✅ View user statistics
- ✅ Access admin panel from home page

---

## File Structure

### New Files
```
login.html           - Login page with authentication form
auth.js              - Core authentication logic
admin.html           - Admin panel for user management
```

### Modified Files
```
index.html           - Added auth check, user header, module filtering
english.html         - Added auth check
aptitude.html        - Added auth check
stories.html         - Added auth check
storage-manager.js   - Updated to be user-specific
worksheet-generator.js - Uses logged-in user's name
english-generator.js   - Uses logged-in user's name
aptitude-generator.js  - Uses logged-in user's name
```

---

## User Workflow

### First Time Setup
1. Open `login.html` in browser
2. Login with default admin credentials
3. Go to Admin Panel (button appears for admin users)
4. Create student users
5. Assign module permissions to each user
6. Users can now login with their credentials

### Regular User Flow
```
Login Page
   ↓
Enter Credentials
   ↓
Home Page (filtered to show only allowed modules)
   ↓
Select Module
   ↓
Work on Worksheets (auto-saved with user's name)
   ↓
Logout
```

### Admin Flow
```
Login as Admin
   ↓
Home Page (all modules visible + Admin Panel button)
   ↓
Click "Admin Panel"
   ↓
View User Statistics
   ↓
Add/Edit/Delete Users
   ↓
Assign Module Permissions
   ↓
Back to Home
```

---

## Authentication Functions

### Core Functions (in `auth.js`)

#### Session Management
```javascript
getCurrentUser()          // Get logged-in user
login(username, password) // Authenticate user
logout()                  // Clear session and redirect to login
requireAuth()             // Require authentication (auto-redirects if not logged in)
requireAdmin()            // Require admin role
```

#### User Management (Admin Only)
```javascript
createUser(userData)         // Create new user
updateUser(username, updates) // Update user properties
deleteUser(username)          // Delete user and their worksheets
getAllUsers()                 // Get all users (without passwords)
```

#### Permission Checking
```javascript
hasModuleAccess(moduleName)  // Check if user has access to module
```

---

## User Data Structure

```javascript
{
  username: "johndoe",
  password: "password123",  // Plain text (should be hashed in production)
  role: "student",          // "admin" or "student"
  fullName: "John Doe",
  modules: {
    math: true,
    english: true,
    aptitude: true,
    stories: false,
    "emotional-quotient": false,
    german: false
  },
  createdAt: "2024-01-15T10:30:00Z"
}
```

---

## Storage Manager Updates

### User-Specific Storage Keys

**Old Format (pre-auth):**
```
worksheet_math_addition-6A
worksheet_english_7A
```

**New Format (with auth):**
```
worksheet_johndoe_math_addition-6A-page1
worksheet_johndoe_english_7A
```

### Key Functions Updated
```javascript
saveWorksheet(subject, identifier, data)    // Now includes username
loadWorksheet(subject, identifier)          // Loads only user's worksheets
clearWorksheet(subject, identifier)         // Clears only user's worksheet
getCompletedWorksheets(subject)             // Gets only user's completed worksheets
```

### Automatic User Name
```javascript
getCurrentUserFullName()  // Returns logged-in user's full name
```

Used in all worksheet generators to auto-fill the student name field.

---

## Security Considerations

### Current Implementation
- ⚠️ Passwords stored in **plain text** in localStorage
- ⚠️ No server-side validation
- ⚠️ Client-side only authentication
- ⚠️ Session stored in localStorage (not httpOnly cookie)

### Production Recommendations
1. **Hash Passwords:** Use bcrypt or similar hashing
2. **Server-Side Auth:** Implement proper backend authentication
3. **Secure Sessions:** Use httpOnly cookies with server validation
4. **HTTPS:** Always use HTTPS in production
5. **Rate Limiting:** Implement login attempt limiting
6. **Token Expiry:** Shorter session timeouts for sensitive data

### For Educational/Local Use
The current implementation is suitable for:
- ✅ Local single-user environments
- ✅ Family use on trusted devices
- ✅ Educational/learning purposes
- ✅ Offline applications

---

## Creating New Users

### Via Admin Panel (UI)
1. Login as admin
2. Click "Admin Panel"
3. Click "+ Add New User"
4. Fill in user details:
   - Username (unique)
   - Full Name
   - Password
   - Role (Student/Admin)
   - Module Access (checkboxes)
5. Click "Create User"

### Via Console (Programmatic)
```javascript
// Open browser console and run:
createUser({
  username: 'student1',
  password: 'pass123',
  fullName: 'Student One',
  role: 'student',
  modules: {
    math: true,
    english: true,
    aptitude: true,
    stories: true,
    'emotional-quotient': false,
    german: false
  }
});
```

---

## Managing Module Access

### Enable/Disable Modules
1. Go to Admin Panel
2. Click "Edit" next to user
3. Check/uncheck module checkboxes
4. Click "Update User"

### What Happens When Module is Disabled
- Module button hidden on home page
- Direct URL access blocked
- User redirected to home with alert message

### Module Names (Technical)
```javascript
{
  math: 'Mathematics',
  english: 'English',
  aptitude: 'Aptitude',
  stories: 'Stories',
  'emotional-quotient': 'Emotional Quotient',
  german: 'German'
}
```

---

## Troubleshooting

### User Can't Login
- Verify username/password are correct
- Check browser console for errors
- Clear localStorage and try again
- Ensure JavaScript is enabled

### Admin Panel Not Showing
- Only appears for users with `role: 'admin'`
- Login with admin account
- Check user data in localStorage

### Worksheets Not Saving
- Ensure user is logged in
- Check browser console for errors
- Verify localStorage is not full
- Check permissions in browser

### Module Access Denied
- Verify user has permission for that module
- Check `modules` object in user data
- Ask admin to grant access

### Lost Admin Password
```javascript
// Reset admin password via browser console:
const users = JSON.parse(localStorage.getItem('users'));
users.admin.password = 'newpassword123';
localStorage.setItem('users', JSON.stringify(users));
```

---

## Session Management

### Session Duration
- **Timeout:** 24 hours from login
- **Auto-expire:** Session expires after 24 hours
- **Re-login:** Required after expiry

### Logout Behavior
- Clears session from localStorage
- Redirects to login page
- Does NOT delete user's saved worksheets

### Multiple Tabs
- Session shared across tabs (same browser)
- Logout in one tab affects all tabs
- Login in one tab affects all tabs

---

## Data Privacy

### What's Stored Locally
```
users               - All user accounts (username, password, preferences)
currentSession      - Active user session
worksheet_{user}_*  - User's saved worksheets
```

### Data Deletion
- **Delete User:** Removes user account AND all their worksheets
- **Logout:** Keeps user account and worksheets
- **Clear Browser Data:** Removes everything (users, sessions, worksheets)

### Data Export/Backup
```javascript
// Export all data
const backup = {
  users: localStorage.getItem('users'),
  worksheets: {}
};

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('worksheet_')) {
    backup.worksheets[key] = localStorage.getItem(key);
  }
}

console.log(JSON.stringify(backup));
// Copy and save to file
```

---

## Testing Checklist

### Basic Authentication
- [ ] Default admin login works
- [ ] Cannot access pages without login
- [ ] Logout redirects to login page
- [ ] Session persists across page refreshes

### User Management
- [ ] Can create new users
- [ ] Can edit user details
- [ ] Can delete users (except admin)
- [ ] Module permissions work correctly

### Worksheet Saving
- [ ] Worksheets save with user's name
- [ ] Different users see different saved worksheets
- [ ] Completion badges show per-user

### Module Access
- [ ] Users only see modules they have access to
- [ ] Direct URL access blocked for unauthorized modules
- [ ] Admin sees all modules

---

## Future Enhancements

### Potential Improvements
1. **Backend Integration:** Connect to server-side authentication
2. **Password Reset:** Email-based password recovery
3. **Profile Settings:** Allow users to change their own password
4. **Progress Reports:** Track and visualize user progress
5. **Parent Accounts:** Allow parents to monitor multiple children
6. **Cloud Sync:** Sync worksheets across devices
7. **Social Login:** Google/Facebook authentication
8. **Two-Factor Auth:** Additional security layer

---

## Support & Maintenance

### Common Admin Tasks

**Add User:**
```
Admin Panel → Add New User → Fill Details → Create
```

**Reset User Password:**
```
Admin Panel → Edit User → Change Password → Update
```

**Grant Module Access:**
```
Admin Panel → Edit User → Check Module → Update
```

**View User Stats:**
```
Admin Panel → View Statistics Card
```

**Delete Inactive User:**
```
Admin Panel → Delete Button → Confirm
```

---

## Conclusion

The authentication system provides:
- ✅ Secure login for all users
- ✅ Role-based access control
- ✅ Per-user worksheet management
- ✅ Admin control panel
- ✅ Module-level permissions
- ✅ Automatic user name display

The system is ready for immediate use in local/educational environments. For production deployment, implement the security recommendations listed above.
