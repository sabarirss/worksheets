// Avatar Renderer - Shared component for displaying CSS-based avatars
// Used in: reward shop preview, header mini-avatar, profile selector

/**
 * Item catalog for avatar customization
 * All items are emoji/CSS-based - no image assets needed
 */
const AVATAR_ITEMS = {
    characters: [
        { id: 'char-smile', emoji: '\u{1F60A}', name: 'Smiley', cost: 0 },
        { id: 'char-cool', emoji: '\u{1F60E}', name: 'Cool', cost: 0 },
        { id: 'char-star', emoji: '\u{1F31F}', name: 'Star', cost: 0 },
        { id: 'char-lion', emoji: '\u{1F981}', name: 'Lion', cost: 5 },
        { id: 'char-cat', emoji: '\u{1F431}', name: 'Cat', cost: 5 },
        { id: 'char-dog', emoji: '\u{1F436}', name: 'Dog', cost: 5 },
        { id: 'char-fox', emoji: '\u{1F98A}', name: 'Fox', cost: 8 },
        { id: 'char-panda', emoji: '\u{1F43C}', name: 'Panda', cost: 10 },
        { id: 'char-unicorn', emoji: '\u{1F984}', name: 'Unicorn', cost: 12 },
        { id: 'char-butterfly', emoji: '\u{1F98B}', name: 'Butterfly', cost: 15 }
    ],
    hats: [
        { id: 'hat-none', emoji: '', name: 'None', cost: 0 },
        { id: 'hat-tophat', emoji: '\u{1F3A9}', name: 'Top Hat', cost: 10 },
        { id: 'hat-crown', emoji: '\u{1F451}', name: 'Crown', cost: 15 },
        { id: 'hat-grad', emoji: '\u{1F393}', name: 'Graduation', cost: 12 },
        { id: 'hat-cap', emoji: '\u{1F9E2}', name: 'Cap', cost: 8 },
        { id: 'hat-bow', emoji: '\u{1F380}', name: 'Bow', cost: 10 },
        { id: 'hat-star', emoji: '\u2B50', name: 'Star', cost: 20 },
        { id: 'hat-sparkle', emoji: '\u{1F31F}', name: 'Sparkle', cost: 25 }
    ],
    frames: [
        { id: 'frame-default', name: 'Default', cost: 0, style: '3px solid #e0e0e0' },
        { id: 'frame-gold', name: 'Gold', cost: 5, style: '3px solid #ffd700' },
        { id: 'frame-rainbow', name: 'Rainbow', cost: 10, style: '3px solid transparent; background-image: linear-gradient(white, white), linear-gradient(90deg, red, orange, yellow, green, blue, violet); background-origin: border-box; background-clip: padding-box, border-box' },
        { id: 'frame-stars', name: 'Stars', cost: 8, style: '3px dashed #ffd700' },
        { id: 'frame-hearts', name: 'Hearts', cost: 8, style: '3px double #e91e63' },
        { id: 'frame-sparkle', name: 'Sparkle', cost: 15, style: '3px solid #667eea; box-shadow: 0 0 8px rgba(102,126,234,0.5)' }
    ],
    backgrounds: [
        { id: 'bg-blue', name: 'Sky Blue', cost: 0, color: '#e3f2fd' },
        { id: 'bg-pink', name: 'Rose Pink', cost: 5, color: '#fce4ec' },
        { id: 'bg-green', name: 'Mint Green', cost: 5, color: '#e8f5e9' },
        { id: 'bg-sunset', name: 'Sunset', cost: 10, color: 'linear-gradient(135deg, #fff3e0, #ffccbc)' },
        { id: 'bg-galaxy', name: 'Galaxy', cost: 15, color: 'linear-gradient(135deg, #1a237e, #4a148c)' },
        { id: 'bg-rainbow', name: 'Rainbow', cost: 15, color: 'linear-gradient(135deg, #ffcdd2, #fff9c4, #c8e6c9, #bbdefb, #e1bee7)' }
    ]
};

// Default avatar state
const DEFAULT_AVATAR = {
    selected: {
        character: 'char-smile',
        hat: 'hat-none',
        frame: 'frame-default',
        background: 'bg-blue'
    },
    purchased: ['char-smile', 'char-cool', 'char-star', 'hat-none', 'frame-default', 'bg-blue'],
    totalStarsEarned: 0,
    starsSpent: 0
};

/**
 * Get an item from the catalog by ID
 */
function getAvatarItem(itemId) {
    for (const category of Object.values(AVATAR_ITEMS)) {
        const item = category.find(i => i.id === itemId);
        if (item) return item;
    }
    return null;
}

/**
 * Get category name for an item ID
 */
function getItemCategory(itemId) {
    for (const [cat, items] of Object.entries(AVATAR_ITEMS)) {
        if (items.find(i => i.id === itemId)) return cat;
    }
    return null;
}

/**
 * Render avatar into a container element
 * @param {HTMLElement} container - Target container
 * @param {object} avatarData - Avatar state (selected, purchased)
 * @param {'small'|'medium'|'large'} size - Display size
 */
function renderAvatar(container, avatarData, size) {
    if (!container) return;
    const data = avatarData || DEFAULT_AVATAR;
    const sel = data.selected || DEFAULT_AVATAR.selected;

    // Sizes
    const sizes = {
        small: { outer: 36, emoji: '1.2em', hat: '0.7em' },
        medium: { outer: 64, emoji: '2em', hat: '1.1em' },
        large: { outer: 120, emoji: '3.5em', hat: '1.8em' }
    };
    const s = sizes[size] || sizes.medium;

    // Get items
    const character = getAvatarItem(sel.character) || AVATAR_ITEMS.characters[0];
    const hat = getAvatarItem(sel.hat);
    const frame = getAvatarItem(sel.frame) || AVATAR_ITEMS.frames[0];
    const bg = getAvatarItem(sel.background) || AVATAR_ITEMS.backgrounds[0];

    // Build background style
    const bgStyle = bg.color.includes('gradient')
        ? `background: ${bg.color};`
        : `background-color: ${bg.color};`;

    // Build frame style
    const frameStyle = frame.style || '3px solid #e0e0e0';

    container.innerHTML = `
        <div class="avatar-display" style="
            position: relative;
            width: ${s.outer}px;
            height: ${s.outer}px;
            border-radius: 50%;
            ${bgStyle}
            border: ${frameStyle};
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: visible;
            flex-shrink: 0;
        ">
            ${hat && hat.emoji ? `<span style="
                position: absolute;
                top: -${Math.round(s.outer * 0.25)}px;
                left: 50%;
                transform: translateX(-50%);
                font-size: ${s.hat};
                line-height: 1;
                z-index: 2;
            ">${hat.emoji}</span>` : ''}
            <span style="font-size: ${s.emoji}; line-height: 1;">${character.emoji}</span>
        </div>
    `;
}

/**
 * Get star balance for a child
 */
function getStarBalance(avatarData) {
    if (!avatarData) return 0;
    return (avatarData.totalStarsEarned || 0) - (avatarData.starsSpent || 0);
}
