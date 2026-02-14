#!/bin/bash

# Script to update HTML files to use Firebase instead of localStorage

echo "Updating HTML files to use Firebase..."

# Firebase SDK lines to add
FIREBASE_SDK='    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

    <!-- Firebase Config -->
    <script src="firebase-config.js"></script>

    <!-- Firebase Auth & Storage -->
    <script src="firebase-auth.js"></script>
    <script src="firebase-storage.js"></script>'

# Files to update (excluding login.html which is already updated)
FILES=(
    "index.html"
    "admin.html"
    "english.html"
    "aptitude.html"
    "stories.html"
    "emotional-quotient.html"
    "german.html"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."

        # Create backup
        cp "$file" "${file}.backup"

        # Replace auth.js with Firebase scripts
        sed -i 's|<script src="auth.js"></script>|'"$FIREBASE_SDK"'|g' "$file"

        # Replace storage-manager.js if present (already included in Firebase SDK)
        sed -i 's|<script src="storage-manager.js"></script>||g' "$file"

        echo "✓ Updated $file"
    else
        echo "⚠ File not found: $file"
    fi
done

echo ""
echo "✅ All files updated!"
echo ""
echo "Next steps:"
echo "1. Set up Firebase project (see FIREBASE_SETUP_GUIDE.md)"
echo "2. Update firebase-config.js with your Firebase credentials"
echo "3. Test locally before deploying"
echo "4. Deploy with: git add . && git commit -m 'Migrated to Firebase' && git push"
