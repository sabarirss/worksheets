// Age-Based Content Filtering System
// Protects younger children from seeing content meant for older kids

// Get current user's age
function getUserAge() {
    const user = getCurrentUser && getCurrentUser();
    return user && user.age ? parseInt(user.age) : null;
}

// Determine age group (easy/medium/hard) based on child's age
function getAgeGroup(age) {
    if (!age || age < 4) return 'easy';
    if (age <= 6) return 'easy';      // Ages 4-6: Easy
    if (age <= 9) return 'medium';    // Ages 7-9: Medium
    return 'hard';                     // Ages 10+: Hard
}

// Determine minimum allowed level for math/english based on age
// Kumon levels go: 6A (easiest) -> 5A -> 4A -> 3A -> 2A (hardest)
// Lower numbers = harder content
function getMinLevel(age) {
    if (!age || age < 4) return 6;
    if (age <= 5) return 6;          // Ages 4-5: Only 6A (easiest)
    if (age === 6) return 5;         // Age 6: 6A, 5A
    if (age === 7) return 4;         // Age 7: 6A, 5A, 4A
    if (age === 8) return 3;         // Age 8: 6A, 5A, 4A, 3A
    return 2;                         // Age 9+: All levels including 2A
}

// Filter level buttons based on age
function filterLevelButtons() {
    const userAge = getUserAge();

    if (!userAge) {
        console.log('No age found for user, showing all content');
        return; // Show all content if age not set
    }

    const ageGroup = getAgeGroup(userAge);
    const minLevel = getMinLevel(userAge);

    console.log(`Filtering content for age ${userAge} (group: ${ageGroup}, min level: ${minLevel}A, showing ${minLevel}A-6A)`);

    // Filter math/english level buttons
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(button => {
        const buttonText = button.textContent || '';

        // Check if this is a difficulty-based button (Easy/Medium/Hard)
        if (buttonText.includes('Easy') || buttonText.includes('Medium') || buttonText.includes('Hard')) {
            let shouldShow = false;

            if (buttonText.includes('Easy')) {
                shouldShow = true; // Everyone can see Easy
            } else if (buttonText.includes('Medium')) {
                shouldShow = (ageGroup === 'medium' || ageGroup === 'hard');
            } else if (buttonText.includes('Hard')) {
                shouldShow = (ageGroup === 'hard');
            }

            if (!shouldShow) {
                button.style.display = 'none';
            }
        }
        // Check if this is a level button (6A, 5A, 4A, 3A, 2A)
        // Lower numbers = harder, so hide levels BELOW minLevel
        else {
            const match = buttonText.match(/(\d+)A/);
            if (match) {
                const levelNum = parseInt(match[1]);

                // Hide if level is too hard (number too low)
                if (levelNum < minLevel) {
                    button.style.display = 'none';
                    console.log(`Hiding level ${levelNum}A (too hard for age ${userAge})`);
                }
            }
        }
    });

    // Filter story difficulty selection buttons
    const difficultyButtons = document.querySelectorAll('.level-btn[onclick*="showStories"]');
    difficultyButtons.forEach(button => {
        const onclick = button.getAttribute('onclick') || '';

        if (onclick.includes("'easy'")) {
            // Everyone can see easy
        } else if (onclick.includes("'medium'")) {
            if (ageGroup === 'easy') {
                button.style.display = 'none';
            }
        } else if (onclick.includes("'hard'")) {
            if (ageGroup !== 'hard') {
                button.style.display = 'none';
            }
        }
    });

    // Filter all other difficulty buttons (drawing, emotional-quotient, german-kids)
    const allDifficultyButtons = document.querySelectorAll('.difficulty-btn');
    allDifficultyButtons.forEach(button => {
        const onclick = button.getAttribute('onclick') || '';
        const buttonText = button.textContent || '';

        let shouldHide = false;

        // Check onclick attribute for difficulty level
        if (onclick.includes("'medium'") || onclick.includes('"medium"') || buttonText.toLowerCase().includes('medium')) {
            shouldHide = (ageGroup === 'easy');
        } else if (onclick.includes("'hard'") || onclick.includes('"hard"') || buttonText.toLowerCase().includes('hard') || buttonText.toLowerCase().includes('advanced')) {
            shouldHide = (ageGroup !== 'hard');
        }

        if (shouldHide) {
            button.style.display = 'none';
        }
    });
}

// Filter subject/module buttons on index page
function filterSubjectButtons() {
    const userAge = getUserAge();

    if (!userAge) {
        console.log('No age found for user, showing all subjects');
        return; // Show all if age not set
    }

    console.log(`Filtering subjects for age ${userAge}`);

    // German B1 is only for ages 10+
    const germanButton = document.querySelector('.subject-btn[onclick*="german.html"]');
    if (germanButton && userAge < 10) {
        germanButton.style.display = 'none';
        console.log('Hiding German B1 for young child');
    }

    // German Kids is for ages 6+ (suitable for early learners)
    const germanKidsButton = document.querySelector('.subject-btn[onclick*="german-kids.html"]');
    if (germanKidsButton && userAge < 6) {
        germanKidsButton.style.display = 'none';
        console.log('Hiding German Kids for child under 6');
    }

    // Emotional Quotient is for ages 7+ (requires emotional understanding)
    const eqButton = document.querySelector('.subject-btn[onclick*="emotional-quotient.html"]');
    if (eqButton && userAge < 7) {
        eqButton.style.display = 'none';
        console.log('Hiding Emotional Quotient for young child');
    }
}

// Initialize age filtering when page loads
function initAgeFilter() {
    // Wait for user to be loaded
    const checkUser = setInterval(() => {
        const user = getCurrentUser && getCurrentUser();
        if (user) {
            clearInterval(checkUser);

            const userAge = getUserAge();
            if (userAge) {
                console.log(`Age filter initialized for user age: ${userAge}`);

                // Apply appropriate filters based on page
                if (document.querySelector('.level-grid')) {
                    filterLevelButtons();
                }
                if (document.querySelector('.subject-grid')) {
                    filterSubjectButtons();
                }
                if (document.querySelector('.difficulty-grid') || document.querySelector('.difficulty-btn')) {
                    filterLevelButtons(); // Reuse same filter for difficulty buttons
                }
            } else {
                console.warn('User age not set. Please update profile with age.');
            }
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkUser), 5000);
}

// Parent mode: Update child's age
async function updateChildAge(newAge) {
    const user = getCurrentUser && getCurrentUser();

    if (!user) {
        alert('You must be logged in to update age');
        return false;
    }

    try {
        const userDoc = firebase.firestore().collection('users').doc(user.uid.substring(0, 20));
        await userDoc.update({
            age: parseInt(newAge)
        });

        console.log(`Updated child age to ${newAge}`);

        // Update cache
        if (currentUserCache) {
            currentUserCache.age = parseInt(newAge);
        }

        // Reload page to apply new filters
        alert('Age updated successfully! Page will reload to apply new filters.');
        window.location.reload();

        return true;
    } catch (error) {
        console.error('Error updating age:', error);
        alert('Failed to update age. Please try again.');
        return false;
    }
}

// Show parent settings modal
function showParentSettings() {
    const userAge = getUserAge();
    const currentAge = userAge || 'Not set';

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 40px; max-width: 500px; width: 90%;">
            <h2 style="margin-top: 0; color: #667eea;">👨‍👩‍👧 Parent Settings</h2>
            <p style="color: #666; margin-bottom: 20px;">
                Content is filtered based on your child's age to ensure age-appropriate learning materials.
            </p>
            <div style="margin: 20px 0;">
                <strong style="color: #333;">Current Age:</strong>
                <span style="color: #667eea; font-size: 1.2em;">${currentAge} years old</span>
            </div>
            <div style="margin: 20px 0;">
                <label style="display: block; font-weight: bold; color: #333; margin-bottom: 10px;">
                    Update Child's Age:
                </label>
                <select id="new-age-select" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em;">
                    <option value="">Select new age</option>
                    <option value="4">4 years old</option>
                    <option value="5">5 years old</option>
                    <option value="6">6 years old</option>
                    <option value="7">7 years old</option>
                    <option value="8">8 years old</option>
                    <option value="9">9 years old</option>
                    <option value="10">10 years old</option>
                    <option value="11">11 years old</option>
                    <option value="12">12 years old</option>
                    <option value="13">13+ years old</option>
                </select>
            </div>
            <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #667eea;">Age Guidelines:</strong>
                <ul style="margin: 10px 0; color: #666; font-size: 0.9em;">
                    <li><strong>Ages 4-5:</strong> Math/English 6A only, Easy stories & aptitude</li>
                    <li><strong>Age 6:</strong> Math/English 6A-5A, Easy content, German Kids available</li>
                    <li><strong>Age 7:</strong> Math/English 6A-4A, Easy + Medium, Emotional Quotient available</li>
                    <li><strong>Age 8:</strong> Math/English 6A-3A, Easy + Medium content</li>
                    <li><strong>Age 9+:</strong> All math/English (6A-2A), Easy + Medium + Hard content</li>
                    <li><strong>Age 10+:</strong> All content including German B1 (adult level)</li>
                    <li style="margin-top: 8px; font-size: 0.85em; color: #888;">Note: In Kumon system, 6A is easiest, 2A is hardest</li>
                </ul>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button onclick="saveNewAge()" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    Save Changes
                </button>
                <button onclick="closeParentSettings()" style="flex: 1; padding: 12px; background: #ddd; color: #333; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeParentSettings();
        }
    });

    // Store modal reference
    window.parentSettingsModal = modal;
}

function closeParentSettings() {
    if (window.parentSettingsModal) {
        window.parentSettingsModal.remove();
        window.parentSettingsModal = null;
    }
}

function saveNewAge() {
    const newAge = document.getElementById('new-age-select').value;

    if (!newAge) {
        alert('Please select an age');
        return;
    }

    updateChildAge(newAge);
    closeParentSettings();
}

// Check if user has permission to access current page
function checkPageAccess() {
    const userAge = getUserAge();

    if (!userAge) {
        console.log('No age set, allowing access to all pages');
        return; // Allow access if age not set
    }

    const currentPage = window.location.pathname.split('/').pop();

    // Block German B1 for children under 10
    if (currentPage === 'german.html' && userAge < 10) {
        alert('This module is for ages 10 and above. Please ask a parent to update your age settings if you are ready for this content.');
        window.location.href = 'index.html';
        return;
    }

    // Block German Kids for children under 6
    if (currentPage === 'german-kids.html' && userAge < 6) {
        alert('This module is for ages 6 and above. Please ask a parent to update your age settings when you are ready.');
        window.location.href = 'index.html';
        return;
    }

    // Block Emotional Quotient for children under 7
    if (currentPage === 'emotional-quotient.html' && userAge < 7) {
        alert('This module is for ages 7 and above. Please ask a parent to update your age settings when you are ready.');
        window.location.href = 'index.html';
        return;
    }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkPageAccess();
        initAgeFilter();
    });
} else {
    checkPageAccess();
    initAgeFilter();
}

console.log('Age filter system loaded');
