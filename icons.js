// GleeGrow Icon Abstraction Layer
// All SVG icons in one place. To switch icon packages: change ONLY the paths in ICON_PATHS.
// Usage: GleeIcons.get('math', 24, '#667eea')  or  <span data-icon="math"></span>

var GleeIcons = (function() {
    var DEFAULT_SIZE = 24;
    var DEFAULT_COLOR = 'currentColor';

    // Base SVG wrapper
    function svg(size, color, paths, opts) {
        opts = opts || {};
        var s = size || DEFAULT_SIZE;
        var c = color || DEFAULT_COLOR;
        var fill = opts.fill || 'none';
        var vb = opts.viewBox || '0 0 24 24';
        var sw = opts.strokeWidth || '1.5';
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
            '" viewBox="' + vb + '" fill="' + fill + '" stroke="' + c +
            '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' +
            paths + '</svg>';
    }

    // Icon registry — ALL icon paths in one place
    var ICON_PATHS = {
        // =============================================
        // SUBJECT ICONS
        // =============================================
        math: '<path d="M4 5h7"/><path d="M4 8h7"/><path d="M7.5 3v8"/>' +   // plus grid
              '<path d="M14 5l6 6"/><path d="M20 5l-6 6"/>' +                  // multiply
              '<path d="M4 16h7"/>' +                                           // minus
              '<path d="M16 14v0.01"/><path d="M16 20v0.01"/><path d="M14 17h4"/>', // divide

        english: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
                 '<path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>' +
                 '<path d="M8 7h8"/><path d="M8 11h5"/>',

        aptitude: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.95.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.43-2z"/>' +
                  '<path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.95.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.43-2z"/>',

        stories: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>' +
                 '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',

        eq: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',

        german: '<circle cx="12" cy="12" r="10"/>' +
                '<path d="M2 12h20"/>' +
                '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',

        drawing: '<path d="M12 20h9"/>' +
                 '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',

        germanKids: '<circle cx="12" cy="12" r="10"/>' +
                    '<path d="M8 14s1.5 2 4 2 4-2 4-2"/>' +
                    '<path d="M9 9h.01"/><path d="M15 9h.01"/>',

        learnEnglishStories: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
                             '<path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>' +
                             '<circle cx="12" cy="10" r="2"/><path d="M12 12v3"/>',

        // =============================================
        // OPERATION ICONS
        // =============================================
        addition: '<path d="M12 5v14"/><path d="M5 12h14"/>',

        subtraction: '<path d="M5 12h14"/>',

        multiplication: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',

        division: '<circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>' +
                  '<path d="M5 12h14"/>' +
                  '<circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>',

        // =============================================
        // NAVIGATION ICONS
        // =============================================
        home: '<path d="M3 12l2-2m0 0l7-7 7 7m-14 0v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-4 0a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1"/>',

        book: '<path d="M12 6.25v13"/>' +
              '<path d="M12 6.25C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13c1.17-.77 2.75-1.25 4.5-1.25s3.33.48 4.5 1.25"/>' +
              '<path d="M12 6.25c1.17-.77 2.75-1.25 4.5-1.25S19.83 5.48 21 6.25v13c-1.17-.77-2.75-1.25-4.5-1.25S13.17 18.48 12 19.25"/>',

        star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none"/>',

        settings: '<circle cx="12" cy="12" r="3"/>' +
                  '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',

        // =============================================
        // ACTION ICONS
        // =============================================
        back: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',

        bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
              '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>',

        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
              '<circle cx="12" cy="7" r="4"/>',

        lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
              '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>',

        unlock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
                '<path d="M7 11V7a5 5 0 0 1 9.9-1"/>',

        plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',

        check: '<path d="M20 6L9 17l-5-5"/>',

        close: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',

        // =============================================
        // UI ICONS
        // =============================================
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
                '<polyline points="16 17 21 12 16 7"/>' +
                '<line x1="21" y1="12" x2="9" y2="12"/>',

        feedback: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',

        keyboard: '<rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>' +
                  '<path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/>' +
                  '<path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/>' +
                  '<path d="M8 16h8"/>',

        pencil: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',

        crown: '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z"/>' +
               '<path d="M5 16h14"/>',

        search: '<circle cx="11" cy="11" r="8"/>' +
                '<path d="M21 21l-4.35-4.35"/>',

        'package': '<path d="M16.5 9.4l-9-5.19"/>' +
                   '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' +
                   '<path d="M3.27 6.96L12 12.01l8.73-5.05"/>' +
                   '<path d="M12 22.08V12"/>',

        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>' +
              '<path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',

        // =============================================
        // PROGRESS ICONS
        // =============================================
        fire: '<path d="M12 12c0-3 2-5 2-8-4 2-8 6-8 10a8 8 0 0 0 16 0c0-1.5-.5-3-2-4.5-1 1-2 2-2 4.5a4 4 0 0 1-8 0 4.5 4.5 0 0 1 2-2z"/>',

        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',

        trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>' +
                '<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>' +
                '<path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>' +
                '<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>' +
                '<path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',

        chart: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',

        // =============================================
        // THEME ICONS (Lucide-based)
        // =============================================
        ocean: '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6"/>' +
               '<path d="M2 16l20 0"/>' +
               '<path d="M17.16 9.05C16.45 6.71 14.42 5 12 5c-2.42 0-4.44 1.71-5.16 4.05"/>' +
               '<path d="M4.64 13.8c.43-.9 1.27-1.8 2.86-1.8 2 0 2.5 2 4.5 2s2.5-2 4.5-2c1.59 0 2.43.9 2.86 1.8"/>' +
               '<circle cx="10" cy="13" r="1" fill="currentColor" stroke="none"/>' +
               '<path d="M16.5 9.4L19 12"/><path d="M9 18l-1 4"/><path d="M15 18l1 4"/>',

        forest: '<path d="M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14"/>' +
                '<path d="M15 9l2.3 2.5a1 1 0 0 1-.7 1.5H7.4a1 1 0 0 1-.7-1.5L9 9"/>' +
                '<path d="M13 5l1.7 1.8a1 1 0 0 1-.7 1.2H10a1 1 0 0 1-.7-1.2L11 5a1 1 0 0 1 2 0z"/>' +
                '<path d="M12 19v3"/>',

        sunset: '<path d="M12 10V2"/>' +
                '<path d="M4.93 10.93l1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/>' +
                '<path d="M19.07 10.93l-1.41 1.41"/>' +
                '<path d="M22 22H2"/><path d="M16 18a4 4 0 0 0-8 0"/>',

        candy: '<path d="M9.5 7.5c-2 2.09-2 5.41 0 7.5"/>' +
               '<path d="M14.5 7.5c2 2.09 2 5.41 0 7.5"/>' +
               '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>' +
               '<path d="M8 2c0 0-3 6-3 10s3 10 3 10"/>' +
               '<path d="M16 2c0 0 3 6 3 10s-3 10-3 10"/>',

        space: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>' +
               '<path d="M14.5 4c-1.2.3-2.3 1.1-3 2.4L9.1 11l5.5 5.5 4.6-2.4c1.3-.7 2.1-1.8 2.4-3C23.2 4.8 19.2.8 14.5 4z"/>' +
               '<circle cx="15" cy="9" r="1"/>' +
               '<path d="M7.5 12L3.2 16.3a2.4 2.4 0 0 0 0 3.4l1.1 1.1a2.4 2.4 0 0 0 3.4 0L12 16.5"/>',

        rainbow: '<path d="M22 17a10 10 0 0 0-20 0"/>' +
                 '<path d="M19 17a7 7 0 0 0-14 0"/>' +
                 '<path d="M16 17a4 4 0 0 0-8 0"/>',

        dinosaur: '<path d="M15.59 3.29A2 2 0 0 0 14 5h-3a2 2 0 0 0-1.59-1.71L8 3a7 7 0 0 0 0 14h8a7 7 0 0 0 0-14z"/>' +
                  '<path d="M10 9v.01"/><path d="M14 9v.01"/>' +
                  '<path d="M6 17l-2 5"/><path d="M18 17l2 5"/>' +
                  '<path d="M10 17l-1 5"/><path d="M14 17l1 5"/>',

        dragon: '<path d="M12 12c0-3 2-5 2-8-4 2-8 6-8 10a8 8 0 0 0 16 0c0-1.5-.5-3-2-4.5-1 1-2 2-2 4.5a4 4 0 0 1-8 0 4.5 4.5 0 0 1 2-2z"/>' +
                '<path d="M8 22l1-5"/><path d="M16 22l-1-5"/>',

        // =============================================
        // ENGLISH-SPECIFIC ICONS
        // =============================================
        writingPen: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>' +
                    '<path d="M15 5l4 4"/>',

        vocab: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
               '<path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>' +
               '<path d="M9 10l2 2 4-4"/>',

        headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/>' +
                    '<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>' +
                    '<path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',

        // =============================================
        // MISC ICONS
        // =============================================
        timer: '<circle cx="12" cy="12" r="10"/>' +
               '<path d="M12 6v6l4 2"/>',

        pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
             '<path d="M14 2v6h6"/><path d="M10 13v4"/><path d="M14 13v4"/>',

        clear: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>' +
               '<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',

        clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>' +
                   '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',

        eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
             '<circle cx="12" cy="12" r="3"/>',

        info: '<circle cx="12" cy="12" r="10"/>' +
              '<path d="M12 16v-4"/><path d="M12 8h.01"/>',

        arrowLeft: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',

        arrowRight: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',

        chevronDown: '<path d="M6 9l6 6 6-6"/>',

        refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>' +
                 '<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>' +
                 '<path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>',

        sparkle: '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>',

        play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>',

        pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>' +
               '<rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',

        stopCircle: '<circle cx="12" cy="12" r="10"/>' +
                    '<rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none"/>',

        // =============================================
        // ADMIN & SETTINGS ICONS
        // =============================================
        upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
                '<polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',

        brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.95.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.43-2z"/>' +
               '<path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.95.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.43-2z"/>',

        beaker: '<path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/>' +
                '<path d="M6 14h12"/>',

        seedling: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>' +
                  '<path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>' +
                  '<path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',

        trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>' +
               '<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',

        volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
                '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
                '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',

        volumeOff: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
                   '<line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',

        users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
               '<circle cx="9" cy="7" r="4"/>' +
               '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',

        baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/>' +
              '<path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/>' +
              '<path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',

        lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>' +
                   '<path d="M9 18h6"/><path d="M10 22h4"/>',

        inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>' +
               '<path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',

        shoppingCart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>' +
                      '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',

        globe: '<circle cx="12" cy="12" r="10"/>' +
               '<path d="M2 12h20"/>' +
               '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',

        checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
                     '<path d="M22 4L12 14.01l-3-3"/>',

        xCircle: '<circle cx="12" cy="12" r="10"/>' +
                 '<line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    };

    // Public API
    var api = {
        // Core getter
        get: function(name, size, color, opts) {
            var paths = ICON_PATHS[name];
            if (!paths) {
                console.warn('GleeIcons: icon \'' + name + '\' not found');
                return '';
            }
            return svg(size, color, paths, opts);
        },

        // Circled variant (icon inside colored circle)
        circled: function(name, size, bgColor, iconColor) {
            var s = size || 56;
            var bg = bgColor || 'var(--color-primary-10)';
            var ic = iconColor || 'var(--color-primary)';
            var iconSize = Math.round(s * 0.55);
            return '<span class="icon-circle" style="display:inline-flex;align-items:center;justify-content:center;width:' +
                s + 'px;height:' + s + 'px;border-radius:50%;background:' + bg + ';flex-shrink:0">' +
                api.get(name, iconSize, ic) + '</span>';
        },

        // Auto-initialize data-icon elements
        // Usage: <span data-icon="math" data-icon-size="24" data-icon-color="#fff"></span>
        //   or:  <span data-icon="math" data-icon-circled="56" data-icon-bg="..." data-icon-color="..."></span>
        init: function() {
            document.querySelectorAll('[data-icon]').forEach(function(el) {
                var name = el.dataset.icon;
                var size = parseInt(el.dataset.iconSize) || DEFAULT_SIZE;
                var color = el.dataset.iconColor || DEFAULT_COLOR;
                var circled = el.dataset.iconCircled;
                if (circled) {
                    el.innerHTML = api.circled(name, parseInt(circled), el.dataset.iconBg, color);
                } else {
                    el.innerHTML = api.get(name, size, color);
                }
            });
        },

        // Check if icon exists
        has: function(name) {
            return !!ICON_PATHS[name];
        },

        // Register or override an icon at runtime
        register: function(name, paths) {
            ICON_PATHS[name] = paths;
        },

        // Get list of all icon names (for testing)
        list: function() {
            return Object.keys(ICON_PATHS);
        }
    };

    return api;
})();
