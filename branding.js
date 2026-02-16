/**
 * GleeGrow App Branding Configuration
 *
 * Change the APP_NAME here to update branding across the entire application
 */

const APP_BRANDING = {
    name: 'GleeGrow',
    tagline: 'Happy Learning!',
    color: '#28a745',  // Brand color (green)
    fontSize: '0.9em',   // Brand name font size
    taglineFontSize: '0.7em'  // Tagline font size
};

// Automatically inject branding into the page header when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Find the branding placeholder div
    const brandingContainer = document.getElementById('app-branding');

    if (brandingContainer) {
        // Create brand name element
        const brandName = document.createElement('div');
        brandName.textContent = APP_BRANDING.name;
        brandName.style.fontSize = APP_BRANDING.fontSize;
        brandName.style.color = APP_BRANDING.color;
        brandName.style.fontWeight = 'bold';
        brandName.style.lineHeight = '1.2';

        // Create tagline element
        const tagline = document.createElement('div');
        tagline.textContent = APP_BRANDING.tagline;
        tagline.style.fontSize = APP_BRANDING.taglineFontSize;
        tagline.style.color = APP_BRANDING.color;
        tagline.style.fontWeight = 'normal';
        tagline.style.fontStyle = 'italic';
        tagline.style.marginTop = '2px';

        // Clear container and add elements
        brandingContainer.innerHTML = '';
        brandingContainer.appendChild(brandName);
        brandingContainer.appendChild(tagline);

        // Center align the branding
        brandingContainer.style.textAlign = 'right';
    }
});
