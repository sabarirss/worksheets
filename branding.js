/**
 * GleeGrow App Branding Configuration
 *
 * Change the APP_NAME here to update branding across the entire application
 */

const APP_BRANDING = {
    name: 'GleeGrow',
    logo: 'gleegrow.png',
    color: '#28a745',
    fontSize: '0.9em'
};

// Automatically inject branding into the page header when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const brandingContainer = document.getElementById('app-branding');

    if (brandingContainer) {
        // Create wrapper for logo + text
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'flex-end';
        wrapper.style.gap = '8px';

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
        brandingContainer.style.textAlign = 'right';
    }
});
