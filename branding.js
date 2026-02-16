/**
 * GleeGrow App Branding Configuration
 *
 * Change the APP_NAME here to update branding across the entire application
 */

const APP_BRANDING = {
    name: 'GleeGrow',
    color: '#667eea',  // Brand color
    fontSize: '0.9em'   // Brand name font size
};

// Automatically inject branding into the page header when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Find the branding placeholder div
    const brandingContainer = document.getElementById('app-branding');

    if (brandingContainer) {
        brandingContainer.textContent = APP_BRANDING.name;
        brandingContainer.style.fontSize = APP_BRANDING.fontSize;
        brandingContainer.style.color = APP_BRANDING.color;
        brandingContainer.style.fontWeight = 'bold';
    }
});
