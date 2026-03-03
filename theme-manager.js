/**
 * Theme Manager for GleeGrow
 *
 * Loads and applies child-specific themes. Themes are stored per-child in
 * Firestore (children/{childId}.theme) and cached in localStorage.
 * Parents can select themes from the child settings modal in profile-selector.
 *
 * Each theme has a unique doodle SVG background pattern using Lucide icons:
 * - Ocean: fish, waves, shells, anchors, sailboats, droplets
 * - Forest: pine trees, flowers, leaves, birds, sprouts, clouds
 * - Sunset: suns, clouds, mountains, sunrises, flames, tents
 * - Candy: candy, cake, ice cream, hearts, cookies, stars
 * - Space: rockets, stars, orbits, moons, telescopes, sparkles
 * - Rainbow: rainbows, music notes, hearts, sparkles, palettes, smiles
 * - Dinosaur: eggs, bones, footprints, mountains, pine trees, flames
 * - Dragon: swords, shields, crowns, castles, flames, gems
 */

/**
 * Lucide icon SVG inner elements (ISC license, lucide.dev).
 * Each icon is designed for a 24x24 viewBox with stroke-based rendering.
 * Used to build recognizable doodle background patterns for each theme.
 */
var LUCIDE_ICONS = {
    'fish': "<path d='M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z'/><path d='M18 12v.5'/><path d='M16 17.93a9.77 9.77 0 0 1 0-11.86'/><path d='M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33'/>",
    'waves': "<path d='M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/><path d='M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/><path d='M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>",
    'shell': "<path d='M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44'/>",
    'anchor': "<path d='M12 6v16'/><path d='m19 13 2-1a9 9 0 0 1-18 0l2 1'/><path d='M9 11h6'/><circle cx='12' cy='4' r='2'/>",
    'sailboat': "<path d='M10 2v15'/><path d='M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z'/><path d='M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z'/>",
    'droplets': "<path d='M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z'/><path d='M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97'/>",
    'tree-pine': "<path d='m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z'/><path d='M12 22v-3'/>",
    'flower-2': "<path d='M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1'/><circle cx='12' cy='8' r='2'/><path d='M12 10v12'/><path d='M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z'/><path d='M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z'/>",
    'leaf': "<path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/><path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/>",
    'bird': "<path d='M16 7h.01'/><path d='M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20'/><path d='m20 7 2 .5-2 .5'/><path d='M10 18v3'/><path d='M14 17.75V21'/><path d='M7 18a6 6 0 0 0 3.84-10.61'/>",
    'sprout': "<path d='M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3'/><path d='M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4'/><path d='M5 21h14'/>",
    'cloud': "<path d='M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'/>",
    'sun': "<circle cx='12' cy='12' r='4'/><path d='M12 2v2'/><path d='M12 20v2'/><path d='m4.93 4.93 1.41 1.41'/><path d='m17.66 17.66 1.41 1.41'/><path d='M2 12h2'/><path d='M20 12h2'/><path d='m6.34 17.66-1.41 1.41'/><path d='m19.07 4.93-1.41 1.41'/>",
    'cloud-sun': "<path d='M12 2v2'/><path d='m4.93 4.93 1.41 1.41'/><path d='M20 12h2'/><path d='m19.07 4.93-1.41 1.41'/><path d='M15.947 12.65a4 4 0 0 0-5.925-4.128'/><path d='M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z'/>",
    'mountain': "<path d='m8 3 4 8 5-5 5 15H2L8 3z'/>",
    'sunrise': "<path d='M12 2v8'/><path d='m4.93 10.93 1.41 1.41'/><path d='M2 18h2'/><path d='M20 18h2'/><path d='m19.07 10.93-1.41 1.41'/><path d='M22 22H2'/><path d='m8 6 4-4 4 4'/><path d='M16 18a4 4 0 0 0-8 0'/>",
    'flame': "<path d='M12 3c.53 2.13 2 4.19 4 6.5s3 3.69 3 5.5a7 7 0 1 1-14 0c0-1.81 1-3.19 3-5.5s3.47-4.37 4-6.5Z'/>",
    'tent': "<path d='M3.5 21 14 3'/><path d='M20.5 21 10 3'/><path d='M15.5 21 12 15l-3.5 6'/><path d='M2 21h20'/>",
    'candy': "<path d='M10 7v10.9'/><path d='M14 6.1V17'/><path d='M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07'/>",
    'cake-slice': "<path d='M16 13H3'/><path d='M16 17H3'/><path d='m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654'/><circle cx='9' cy='7' r='2'/>",
    'ice-cream-cone': "<path d='m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11'/><path d='M17 7A5 5 0 0 0 7 7'/><path d='M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4'/>",
    'heart': "<path d='M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5'/>",
    'cookie': "<path d='M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5'/><path d='M8.5 8.5v.01'/><path d='M16 15.5v.01'/><path d='M12 12v.01'/><path d='M11 17v.01'/><path d='M7 14v.01'/>",
    'star': "<path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'/>",
    'rocket': "<path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09'/><path d='M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z'/><path d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05'/><path d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'/>",
    'orbit': "<path d='M20.341 6.484A10 10 0 0 1 10.266 21.85'/><path d='M3.659 17.516A10 10 0 0 1 13.74 2.152'/><circle cx='12' cy='12' r='3'/><circle cx='19' cy='5' r='2'/><circle cx='5' cy='19' r='2'/>",
    'moon': "<path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'/>",
    'telescope': "<path d='m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44'/><path d='m13.56 11.747 4.332-.924'/><path d='m16 21-3.105-6.21'/><path d='m6.158 8.633 1.114 4.456'/><path d='m8 21 3.105-6.21'/><circle cx='12' cy='13' r='2'/>",
    'sparkles': "<path d='M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'/><path d='M20 2v4'/><path d='M22 4h-4'/><circle cx='4' cy='20' r='2'/>",
    'rainbow': "<path d='M22 17a10 10 0 0 0-20 0'/><path d='M6 17a6 6 0 0 1 12 0'/><path d='M10 17a2 2 0 0 1 4 0'/>",
    'music': "<path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/>",
    'palette': "<path d='M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z'/><circle cx='13.5' cy='6.5' r='.5'/><circle cx='17.5' cy='10.5' r='.5'/><circle cx='6.5' cy='12.5' r='.5'/><circle cx='8.5' cy='7.5' r='.5'/>",
    'smile': "<circle cx='12' cy='12' r='10'/><path d='M8 14s1.5 2 4 2 4-2 4-2'/><line x1='9' x2='9.01' y1='9' y2='9'/><line x1='15' x2='15.01' y1='9' y2='9'/>",
    'egg': "<path d='M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12'/>",
    'bone': "<path d='M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z'/>",
    'footprints': "<path d='M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z'/><path d='M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z'/><path d='M16 17h4'/><path d='M4 13h4'/>",
    'sword': "<path d='m11 19-6-6'/><path d='m5 21-2-2'/><path d='m8 16-4 4'/><path d='M9.5 17.5 21 6V3h-3L6.5 14.5'/>",
    'shield': "<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/>",
    'crown': "<path d='M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z'/><path d='M5 21h14'/>",
    'castle': "<path d='M10 5V3'/><path d='M14 5V3'/><path d='M15 21v-3a3 3 0 0 0-6 0v3'/><path d='M18 3v8'/><path d='M18 5H6'/><path d='M22 11H2'/><path d='M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9'/><path d='M6 3v8'/>",
    'gem': "<path d='M10.5 3 8 9l4 13 4-13-2.5-6'/><path d='M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z'/><path d='M2 9h20'/>"
};

/**
 * Theme-to-icon mapping. Each theme uses 6 Lucide icons for its doodle pattern.
 */
var THEME_ICON_NAMES = {
    ocean: ['fish', 'waves', 'shell', 'anchor', 'sailboat', 'droplets'],
    forest: ['tree-pine', 'flower-2', 'leaf', 'bird', 'sprout', 'cloud'],
    sunset: ['sun', 'cloud-sun', 'mountain', 'sunrise', 'flame', 'tent'],
    candy: ['candy', 'cake-slice', 'ice-cream-cone', 'heart', 'cookie', 'star'],
    space: ['rocket', 'star', 'orbit', 'moon', 'telescope', 'sparkles'],
    rainbow: ['rainbow', 'music', 'heart', 'sparkles', 'palette', 'smile'],
    dinosaur: ['egg', 'bone', 'footprints', 'mountain', 'tree-pine', 'flame'],
    dragon: ['sword', 'shield', 'crown', 'castle', 'flame', 'gem']
};

/**
 * Generate theme-specific doodle SVG content.
 * Returns SVG element strings for the given theme using Lucide icons
 * arranged on a 6x6 staggered grid (600x600 canvas).
 */
function getThemeDoodlePaths(theme) {
    var icons = THEME_ICON_NAMES[theme] || THEME_ICON_NAMES.ocean;
    var S = 1.67; // Scale 24x24 icons to ~40px
    var COLS = [50, 150, 250, 350, 450, 550];
    var ROWS = [50, 150, 250, 350, 450, 550];
    // Stagger offsets per row so no adjacent cells (horizontal or vertical) share the same icon
    var OFFSETS = [0, 3, 1, 4, 2, 5];

    var svg = '';
    for (var r = 0; r < 6; r++) {
        var off = OFFSETS[r];
        for (var c = 0; c < 6; c++) {
            var idx = (c + off) % 6;
            var x = COLS[c];
            var y = ROWS[r];
            svg += "<g transform='translate(" + x + "," + y + ") scale(" + S + ") translate(-12,-12)'>" +
                LUCIDE_ICONS[icons[idx]] + "</g>";
        }
    }
    return svg;
}

const THEMES = {
    ocean:  { name: 'Ocean Blue',    iconKey: 'ocean', gradient: 'linear-gradient(135deg, #7c93f0 0%, #9b7fc4 100%)', doodleColor: '#667eea' },
    forest: { name: 'Forest Green',  iconKey: 'forest', gradient: 'linear-gradient(135deg, #5dd99a 0%, #4ecdc4 100%)', doodleColor: '#2ecc71' },
    sunset: { name: 'Sunset Orange', iconKey: 'sunset', gradient: 'linear-gradient(135deg, #e8937e 0%, #fdd889 100%)', doodleColor: '#e17055' },
    candy:  { name: 'Candy Pink',    iconKey: 'candy', gradient: 'linear-gradient(135deg, #fda0c0 0%, #b8b4fe 100%)', doodleColor: '#fd79a8' },
    space:  { name: 'Space Purple',  iconKey: 'space', gradient: 'linear-gradient(135deg, #8b7eef 0%, #5a6c8a 100%)', doodleColor: '#6c5ce7' },
    rainbow: { name: 'Rainbow',       iconKey: 'rainbow', gradient: 'linear-gradient(135deg, #f075b5 0%, #fdd889 33%, #5ee8e4 66%, #9b8ef0 100%)', doodleColor: '#e84393' },
    dinosaur:{ name: 'Dinosaur',      iconKey: 'dinosaur', gradient: 'linear-gradient(135deg, #a1887f 0%, #81c784 100%)', doodleColor: '#8d6e63' },
    dragon:  { name: 'Dragon',        iconKey: 'dragon', gradient: 'linear-gradient(135deg, #ef5350 0%, #ff8a65 100%)', doodleColor: '#c62828' }
};

const DEFAULT_THEME = 'ocean';

/**
 * Apply a theme to the current page.
 * Sets data-theme attribute on <html> for CSS variable overrides.
 */
function applyTheme(themeName) {
    const theme = themeName && THEMES[themeName] ? themeName : DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', theme);
    // Store in localStorage for instant load on next page
    localStorage.setItem('gleegrow-theme', theme);
    // Apply theme-specific doodle background
    applyThemeDoodle(theme);
    // BUG-044: Force repaint on ALL gradient elements (CSS variable changes in
    // linear-gradient() don't always trigger browser repaint)
    applyThemeGradients(theme);
}

/**
 * BUG-044: Force gradient repaint on ALL elements using var(--color-primary-gradient).
 * CSS variable changes inside linear-gradient() don't always trigger browser repaint.
 * We explicitly set the gradient via JS on all known gradient elements.
 */
function applyThemeGradients(themeName) {
    var themeConfig = THEMES[themeName] || THEMES[DEFAULT_THEME];
    var gradient = themeConfig.gradient;

    // All CSS selectors that use var(--color-primary-gradient)
    var gradientSelectors = [
        '.user-header',
        '.control-buttons button',
        '.back-row button',
        '.navigation button',
        '.eraser-btn',
        '#greeting-banner'
    ].join(',');

    var elements = document.querySelectorAll(gradientSelectors);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.background = gradient;
    }

    // Also update inline-styled gradient elements (buttons in modals, etc.)
    var allStyled = document.querySelectorAll('[style]');
    for (var j = 0; j < allStyled.length; j++) {
        var bg = allStyled[j].style.background || '';
        if (bg.indexOf('--color-primary-gradient') !== -1 || bg.indexOf('linear-gradient') !== -1) {
            // Skip elements that should keep their own gradient
            if (allStyled[j].id === 'version-badge') continue;
            if (allStyled[j].classList.contains('theme-option')) continue;
            allStyled[j].style.background = gradient;
        }
    }

    // Force body background-color repaint
    var root = document.documentElement;
    var bgColor = getComputedStyle(root).getPropertyValue('--color-bg');
    if (bgColor) {
        document.body.style.backgroundColor = bgColor.trim();
    }
}

/**
 * Apply theme-specific doodle SVG as body background-image.
 * Each theme has unique doodle illustrations matching its motif.
 */
function applyThemeDoodle(themeName) {
    const themeConfig = THEMES[themeName] || THEMES[DEFAULT_THEME];
    const color = themeConfig.doodleColor;
    const paths = getThemeDoodlePaths(themeName);
    const opacity = window.innerWidth >= 1025 ? '0.16' : '0.1';
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>" +
        "<g opacity='" + opacity + "' fill='none' stroke='" + color + "' stroke-width='2' " +
        "stroke-linecap='round' stroke-linejoin='round'>" + paths + "</g></svg>";
    // Minimal encoding for data URI
    const encoded = svg.replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E');
    document.body.style.backgroundImage = "url(\"data:image/svg+xml," + encoded + "\")";
}

/**
 * Get the current child's theme from localStorage cache.
 * Called on every page load.
 *
 * BUG-041: gleegrow-theme in localStorage is the single source of truth.
 * It is updated synchronously by saveChildTheme() and applyTheme().
 * We do NOT override it with child.theme from Firestore because Firestore
 * data may be stale (race condition on page refresh).
 * On first load for a new child (no cache), we fall back to child.theme.
 */
function loadTheme() {
    // Primary: use cached theme (always set synchronously by saveChildTheme)
    const cached = localStorage.getItem('gleegrow-theme');
    if (cached && THEMES[cached]) {
        applyTheme(cached);
        return;
    }

    // Fallback: first load / no cache — use child's stored theme
    if (typeof getSelectedChild === 'function') {
        const child = getSelectedChild();
        if (child && child.theme && THEMES[child.theme]) {
            applyTheme(child.theme);
            return;
        }
    }

    // Default theme if nothing found
    applyTheme(DEFAULT_THEME);
}

/**
 * Save theme for a child to Firestore and update local cache.
 */
async function saveChildTheme(childId, themeName) {
    if (!childId || !THEMES[themeName]) return;

    // BUG-041: Apply theme immediately (optimistic update) before Firestore write
    applyTheme(themeName);

    // Update localStorage cache immediately
    const childStr = localStorage.getItem('selectedChild');
    if (childStr) {
        try {
            const child = JSON.parse(childStr);
            if (child.id === childId) {
                child.theme = themeName;
                localStorage.setItem('selectedChild', JSON.stringify(child));
            }
        } catch (e) { /* ignore parse errors */ }
    }

    // Then persist to Firestore (async, may take time)
    try {
        await firebase.firestore().collection('children').doc(childId).update({
            theme: themeName,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Theme saved: ' + themeName + ' for child ' + childId);
    } catch (error) {
        console.error('Error saving theme to Firestore:', error);
    }
}

/**
 * Get the theme name for the current selected child.
 */
function getCurrentTheme() {
    const cached = localStorage.getItem('gleegrow-theme');
    return cached && THEMES[cached] ? cached : DEFAULT_THEME;
}

// Auto-apply theme on page load
if (document.readyState === 'loading') {
    // Apply cached theme immediately (before DOM is ready, for no flash)
    const earlyCache = localStorage.getItem('gleegrow-theme');
    if (earlyCache && THEMES[earlyCache]) {
        document.documentElement.setAttribute('data-theme', earlyCache);
    }
    document.addEventListener('DOMContentLoaded', loadTheme);
} else {
    loadTheme();
}
