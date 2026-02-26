/**
 * GleeGrow App Branding Configuration
 *
 * Renders logo + brand name on the top-left of every page.
 * Clicking the logo navigates to home, with unsaved-data warning if on a worksheet.
 */

const APP_BRANDING = {
    name: 'GleeGrow',
    logo: 'gleegrow.png',
    color: '#28a745',
    fontSize: '0.9em'
};

/**
 * Navigate to home page. Stops timers and warns about unsaved worksheet data.
 */
function brandingGoHome() {
    // Check if user is on a worksheet with unsaved changes
    if (typeof hasUnsavedChanges !== 'undefined' && hasUnsavedChanges) {
        const leave = confirm('You have unsaved worksheet data. Are you sure you want to leave? Your progress will be lost.');
        if (!leave) return;
    }

    // Stop any running timer
    if (typeof stopTimer === 'function') {
        try { stopTimer(); } catch (e) { /* timer may not be active */ }
    }

    // Navigate to home
    window.location.href = 'index';
}

// Automatically inject branding into the page header when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const brandingContainer = document.getElementById('app-branding');

    if (brandingContainer) {
        // Create clickable wrapper for logo + text
        const wrapper = document.createElement('a');
        wrapper.href = '#';
        wrapper.onclick = function(e) { e.preventDefault(); brandingGoHome(); };
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';
        wrapper.style.textDecoration = 'none';
        wrapper.style.cursor = 'pointer';
        wrapper.title = 'Go to Home';

        // Create logo image
        const logo = document.createElement('img');
        logo.src = APP_BRANDING.logo;
        logo.alt = APP_BRANDING.name;
        logo.style.height = '36px';
        logo.style.width = 'auto';

        // Create brand name element
        const brandName = document.createElement('div');
        brandName.textContent = APP_BRANDING.name;
        brandName.style.fontSize = APP_BRANDING.fontSize;
        brandName.style.color = APP_BRANDING.color;
        brandName.style.fontWeight = 'bold';
        brandName.style.lineHeight = '1.2';

        wrapper.appendChild(logo);
        wrapper.appendChild(brandName);

        brandingContainer.innerHTML = '';
        brandingContainer.appendChild(wrapper);
    }
});
