// Parent Feedback System
// Collects general and per-module feedback from parents
// Stores in Firestore and summarizes for platform improvement

/**
 * FEEDBACK CATEGORIES:
 * - General: Overall platform experience
 * - Per Module: Math, English, Aptitude, Stories, Drawing, EQ, German
 * - Rating: 1-5 stars
 * - Text: What's good, what needs improvement
 */

const FEEDBACK_MODULES = [
    { id: 'general', name: 'Overall Platform', icon: '🏠' },
    { id: 'math', name: 'Mathematics', icon: '📐' },
    { id: 'english', name: 'English', icon: '📚' },
    { id: 'aptitude', name: 'Aptitude', icon: '🧩' },
    { id: 'stories', name: 'Stories', icon: '📖' },
    { id: 'drawing', name: 'Drawing', icon: '🎨' },
    { id: 'eq', name: 'Emotional Quotient', icon: '❤️' },
    { id: 'german', name: 'German', icon: '🇩🇪' },
];

// ============================================================================
// FEEDBACK UI
// ============================================================================

/**
 * Open the feedback modal for parents.
 */
function openFeedbackModal() {
    // Remove existing modal if any
    const existing = document.getElementById('feedback-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'feedback-modal';

    const moduleTabs = FEEDBACK_MODULES.map((m, idx) => `
        <button class="feedback-tab ${idx === 0 ? 'active' : ''}"
                onclick="switchFeedbackTab('${m.id}')"
                id="feedback-tab-${m.id}"
                style="
                    padding: 8px 16px;
                    border: 2px solid ${idx === 0 ? '#667eea' : '#ddd'};
                    background: ${idx === 0 ? '#667eea' : 'white'};
                    color: ${idx === 0 ? 'white' : '#333'};
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.85em;
                    white-space: nowrap;
                    transition: all 0.2s;
                ">
            ${m.icon} ${m.name}
        </button>
    `).join('');

    const modulePages = FEEDBACK_MODULES.map((m, idx) => `
        <div class="feedback-page" id="feedback-page-${m.id}" style="display: ${idx === 0 ? 'block' : 'none'};">
            <h3 style="margin: 0 0 15px 0; color: #333;">${m.icon} ${m.name} Feedback</h3>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">Rating</label>
                <div class="star-rating" id="rating-${m.id}" style="display: flex; gap: 8px;">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <button onclick="setRating('${m.id}', ${star})" id="star-${m.id}-${star}"
                            style="
                                font-size: 2em;
                                background: none;
                                border: none;
                                cursor: pointer;
                                transition: transform 0.2s;
                                color: #ddd;
                            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                            ★
                        </button>
                    `).join('')}
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">What do you like?</label>
                <textarea id="feedback-good-${m.id}" rows="3" placeholder="Tell us what's working well..."
                    style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 10px; font-size: 0.95em; resize: vertical; box-sizing: border-box;"></textarea>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">What could be better?</label>
                <textarea id="feedback-improve-${m.id}" rows="3" placeholder="Tell us what needs improvement..."
                    style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 10px; font-size: 0.95em; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div style="
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
            padding: 20px;
        " onclick="if(event.target===this)closeFeedbackModal()">
            <div style="
                background: white; border-radius: 20px;
                max-width: 600px; width: 100%;
                max-height: 90vh; overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="
                    padding: 25px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px 20px 0 0;
                    display: flex; justify-content: space-between; align-items: center;
                ">
                    <h2 style="margin: 0; color: white; font-size: 1.4em;">Share Your Feedback</h2>
                    <button onclick="closeFeedbackModal()" style="
                        background: rgba(255,255,255,0.2); border: none; color: white;
                        width: 35px; height: 35px; border-radius: 50%;
                        font-size: 1.3em; cursor: pointer;
                    ">✕</button>
                </div>

                <div style="padding: 20px 30px;">
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 0.95em;">
                        Help us improve GleeGrow! Rate each module and share what you think.
                    </p>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                        ${moduleTabs}
                    </div>

                    ${modulePages}
                </div>

                <div style="padding: 20px 30px; border-top: 2px solid #f0f0f0; display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="closeFeedbackModal()" style="
                        padding: 12px 25px; background: #6c757d; color: white;
                        border: none; border-radius: 10px; cursor: pointer; font-size: 1em;
                    ">Cancel</button>
                    <button onclick="submitFeedback()" id="feedback-submit-btn" style="
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white; border: none; border-radius: 10px;
                        font-size: 1.05em; font-weight: bold; cursor: pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Switch between module feedback tabs.
 */
function switchFeedbackTab(moduleId) {
    // Hide all pages
    FEEDBACK_MODULES.forEach(m => {
        const page = document.getElementById(`feedback-page-${m.id}`);
        const tab = document.getElementById(`feedback-tab-${m.id}`);
        if (page) page.style.display = 'none';
        if (tab) {
            tab.style.background = 'white';
            tab.style.color = '#333';
            tab.style.borderColor = '#ddd';
        }
    });

    // Show selected page
    const selectedPage = document.getElementById(`feedback-page-${moduleId}`);
    const selectedTab = document.getElementById(`feedback-tab-${moduleId}`);
    if (selectedPage) selectedPage.style.display = 'block';
    if (selectedTab) {
        selectedTab.style.background = '#667eea';
        selectedTab.style.color = 'white';
        selectedTab.style.borderColor = '#667eea';
    }
}

// Feedback state (ratings per module)
const feedbackRatings = {};

/**
 * Set star rating for a module.
 */
function setRating(moduleId, rating) {
    feedbackRatings[moduleId] = rating;

    // Update star colors
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star-${moduleId}-${i}`);
        if (star) {
            star.style.color = i <= rating ? '#ffc107' : '#ddd';
        }
    }
}

/**
 * Close feedback modal.
 */
function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) modal.remove();
}

// ============================================================================
// FEEDBACK SUBMISSION
// ============================================================================

/**
 * Submit all feedback to Firestore.
 */
async function submitFeedback() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) {
        alert('Please log in to submit feedback');
        return;
    }

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;

    // Collect feedback from all modules
    const feedbackData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.fullName || user.username,
        childId: child ? child.id : null,
        childName: child ? child.name : null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        modules: {}
    };

    let hasContent = false;

    FEEDBACK_MODULES.forEach(m => {
        const rating = feedbackRatings[m.id] || 0;
        const good = document.getElementById(`feedback-good-${m.id}`)?.value.trim() || '';
        const improve = document.getElementById(`feedback-improve-${m.id}`)?.value.trim() || '';

        if (rating > 0 || good || improve) {
            hasContent = true;
            feedbackData.modules[m.id] = {
                name: m.name,
                rating: rating,
                good: good,
                improve: improve
            };
        }
    });

    if (!hasContent) {
        alert('Please provide at least one rating or comment before submitting.');
        return;
    }

    // Disable submit button
    const submitBtn = document.getElementById('feedback-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    try {
        await firebase.firestore().collection('feedback').add(feedbackData);

        // Show success and close
        alert('Thank you for your feedback! It helps us improve GleeGrow.');
        closeFeedbackModal();

    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
        }
    }
}

// ============================================================================
// FEEDBACK BUTTON (for header/settings integration)
// ============================================================================

/**
 * Add a feedback button to the header or settings page.
 * @param {HTMLElement} container
 */
function addFeedbackButton(container) {
    if (!container) return;

    const btn = document.createElement('button');
    btn.className = 'header-btn';
    btn.style.cssText = 'padding: 10px 20px; border: 2px solid white; background: transparent; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;';
    btn.textContent = '💬 Feedback';
    btn.onclick = openFeedbackModal;

    container.appendChild(btn);
}

console.log('Feedback system loaded');
