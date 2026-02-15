# Educational Practice Worksheets Platform

A comprehensive web-based learning platform for children's education with parent management and multi-child profile support.

## 🎯 Core Features

### Parent Management System
- **Parent Accounts**: Secure authentication with email verification
- **Multi-Child Profiles**: Parents can manage multiple children under one account
- **Age-Based Content**: Automatic content filtering based on child's age
- **Progress Tracking**: Per-child worksheet completion and learning progress
- **Module Access Control**: Admin-controlled package allocation per child

### Child Profiles
- Profile includes: Name, Gender, Date of Birth, Grade
- Age automatically calculated from DOB
- Avatar-based visual identification (👦👧)
- Profile selector with persistent sessions

### Educational Content

#### 📐 Mathematics (Ages 4-10+)
- **Operations**: Addition, Subtraction, Multiplication, Division
- **Difficulty Levels**: Easy, Medium, Hard per age group
- **Age Groups**: 4-5, 6, 7, 8, 9+, 10+
- Auto-grading with instant feedback

#### 📚 English (Ages 4-10+)
- **Writing Worksheets**: Vocabulary, grammar, handwriting practice
- **Reading Stories**: Interactive stories with comprehension questions
- **Writing Practice**: Ruled-line handwriting for ages 4-8
- **Cursive Writing**: Joined handwriting practice for age 8

#### 🧩 Aptitude & Logic
- Pattern recognition, counting, sequences
- Matching, odd-one-out, comparison
- Age-appropriate difficulty levels

#### 📖 Stories Module
- Multiple story categories and difficulties
- Reading comprehension questions
- Age-filtered content

#### 🎨 Drawing Tutorials
- Step-by-step drawing lessons
- Age-appropriate complexity

#### 🇩🇪 German Learning
- **German Kids**: Stories and exercises for children
- **German B1**: Adult DTZ test preparation

#### 💭 Emotional Quotient (EQ)
- Social-emotional learning exercises
- Age-appropriate scenarios and questions

## 🏗️ Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **PDF Generation**: html2pdf.js
- **Responsive Design**: Mobile, tablet, desktop support

### Key Components

```
├── Authentication System (firebase-auth.js)
├── Parent Dashboard (index.html)
├── Child Profile Manager (children-profiles.html)
├── Profile Selector (profile-selector.js)
├── Module Generators
│   ├── worksheet-generator.js (Math)
│   ├── english-generator.js
│   ├── aptitude-generator.js
│   ├── stories-generator.js
│   ├── drawing-generator.js
│   ├── eq-generator.js
│   └── german-generator.js
├── Storage Manager (firebase-storage.js)
├── Age Filter (age-filter.js)
└── Admin Panel (admin.html)
```

### Firebase Collections

```
users/
  - uid, username, email, fullName
  - role: 'parent' | 'admin'
  - modules: { math, english, aptitude, ... }

children/
  - parent_uid, name, gender, date_of_birth
  - age (calculated), grade
  - modules: per-child access control

worksheets/
  - parent_uid, child_id
  - subject, difficulty, content
  - completed, score, timestamp
```

## 🔒 Security & Privacy

### COPPA/GDPR Compliance
- Parent-managed accounts (parental consent built-in)
- Children profiles under parent control
- Age verification through parent oversight
- Comprehensive Terms & Conditions

### Data Protection
- Minimal data collection (name, age, email only)
- Purpose limitation: educational use only
- Right to erasure: account deletion removes all data
- No AI training, no third-party sharing
- No advertising or tracking

### Session Management
- Single active session per child across devices
- Automatic logout on concurrent login
- Secure authentication with Firebase

## 👨‍💼 Admin Features

### Dashboard
- Parent-children hierarchy tree view
- Per-child module allocation
- User management and statistics
- DOB change approval workflow (planned)

### Package Management
- Enable/disable modules per child
- Demo version with limited access
- Version upgrade requests

## 🎨 User Experience

### Worksheet Features
- Clean, distraction-free interface
- Built-in timer for tracking completion time
- Instant auto-grading with visual feedback (✓/✗)
- Answer key toggle
- PDF export with timestamp
- Handwriting input support (iPad pencil compatible)
- Ruled lines for writing practice

### Responsive Design
- Desktop: Full-featured experience
- Tablet: Touch-optimized, large buttons
- Mobile: Adapted layouts, mobile keyboards

### Personalization
- Worksheets use child's name
- Age-appropriate content filtering
- Progress tracking per child
- Customizable difficulty levels

## 📊 Content Statistics

### Total Content Available
- **Math**: 72 combinations (4 operations × 6 ages × 3 difficulties)
- **English**: 18 writing levels + 25+ reading stories
- **Aptitude**: 126 combinations (7 types × 6 ages × 3 difficulties)
- **Stories**: 54 combinations (3 categories × 6 ages × 3 difficulties)
- **Drawing**: 18 tutorials across ages
- **German Kids**: 15 combinations
- **EQ**: 18 combinations
- **German B1**: 8 modules (adult level)

### Demo Limitations
- Math: 2 pages per worksheet
- English/Aptitude: 5 worksheets per difficulty
- Stories: 3 stories per level
- Upgradeable to full version

## 🚀 Recent Updates

### Multi-Child Profile System
- Converted from single-child to multi-child support
- Profile selector with persistent selection
- Age-based content filtering per child
- Per-child progress tracking

### Legal Compliance
- Added comprehensive Terms & Conditions
- Implemented parental consent workflow
- COPPA/GDPR compliant architecture
- Single session enforcement

### UI Improvements
- Ruled lines in handwriting canvases (red/blue)
- Cursive writing practice for age 8
- Profile selector in header
- Admin parent-children tree view

## 📝 License

Proprietary - All rights reserved.

---

**Built with educational excellence in mind** 🎓
