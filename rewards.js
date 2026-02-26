// Reward Shop Logic
// Handles item purchasing, equipping, star balance, and shop rendering

let currentShopTab = 'characters';
let childAvatarData = null;

/**
 * Initialize the reward shop
 */
async function initRewardShop() {
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) {
        console.warn('No child selected for reward shop');
        return;
    }

    // Load avatar data from Firestore
    try {
        const childDoc = await firebase.firestore().collection('children').doc(child.id).get();
        if (childDoc.exists) {
            const data = childDoc.data();
            childAvatarData = data.avatar || JSON.parse(JSON.stringify(DEFAULT_AVATAR));
        } else {
            childAvatarData = JSON.parse(JSON.stringify(DEFAULT_AVATAR));
        }
    } catch (error) {
        console.error('Error loading avatar data:', error);
        childAvatarData = JSON.parse(JSON.stringify(DEFAULT_AVATAR));
    }

    renderShop();
}

/**
 * Render the full shop UI
 */
function renderShop() {
    renderStarBalance();
    renderAvatarPreview();
    renderShopTabs();
    renderShopItems();
}

/**
 * Render star balance display
 */
function renderStarBalance() {
    const el = document.getElementById('star-balance-display');
    if (!el) return;
    const balance = getStarBalance(childAvatarData);
    el.innerHTML = `
        <div>
            <div class="balance-label">Your Stars</div>
            <div class="balance-amount"><span class="balance-icon">\u2B50</span>${balance}</div>
        </div>
        <div style="text-align: right;">
            <div class="balance-label">Total Earned</div>
            <div style="font-size: 1.1em; font-weight: 700;">${childAvatarData.totalStarsEarned || 0}</div>
        </div>
    `;
}

/**
 * Render the avatar preview
 */
function renderAvatarPreview() {
    const container = document.getElementById('avatar-preview-container');
    if (!container || typeof renderAvatar !== 'function') return;
    renderAvatar(container, childAvatarData, 'large');
}

/**
 * Render category tabs
 */
function renderShopTabs() {
    const tabsEl = document.getElementById('shop-tabs');
    if (!tabsEl) return;

    const tabLabels = {
        characters: '\u{1F60A} Characters',
        hats: '\u{1F3A9} Hats',
        frames: '\u2728 Frames',
        backgrounds: '\u{1F308} Backgrounds'
    };

    tabsEl.innerHTML = Object.entries(tabLabels).map(([key, label]) =>
        `<button class="shop-tab ${key === currentShopTab ? 'active' : ''}" onclick="switchShopTab('${key}')">${label}</button>`
    ).join('');
}

/**
 * Switch active shop tab
 */
function switchShopTab(tab) {
    currentShopTab = tab;
    renderShopTabs();
    renderShopItems();
}

/**
 * Render items grid for current tab
 */
function renderShopItems() {
    const gridEl = document.getElementById('shop-items-grid');
    if (!gridEl) return;

    const items = AVATAR_ITEMS[currentShopTab] || [];
    const purchased = childAvatarData.purchased || [];
    const selected = childAvatarData.selected || {};
    const balance = getStarBalance(childAvatarData);

    // Map category to selected key
    const categoryToKey = {
        characters: 'character',
        hats: 'hat',
        frames: 'frame',
        backgrounds: 'background'
    };
    const selKey = categoryToKey[currentShopTab];
    const equippedId = selected[selKey];

    gridEl.innerHTML = items.map(item => {
        const isOwned = purchased.includes(item.id);
        const isEquipped = equippedId === item.id;
        const canAfford = balance >= item.cost;
        const isFree = item.cost === 0;

        let statusHtml = '';
        if (isEquipped) {
            statusHtml = '<div class="item-status status-equipped">Equipped</div>';
        } else if (isOwned) {
            statusHtml = '<div class="item-status status-owned">Owned</div>';
        } else if (isFree) {
            statusHtml = '<div class="item-status status-free">Free</div>';
        }

        let previewHtml = '';
        if (currentShopTab === 'frames') {
            previewHtml = `<div class="frame-preview-circle" style="border: ${item.style};">\u{1F60A}</div>`;
        } else if (currentShopTab === 'backgrounds') {
            const bgStyle = item.color.includes('gradient')
                ? `background: ${item.color};`
                : `background-color: ${item.color};`;
            previewHtml = `<div class="bg-preview-swatch" style="${bgStyle}"></div>`;
        } else {
            previewHtml = `<div class="item-preview">${item.emoji || ''}</div>`;
        }

        const cardClass = isEquipped ? 'equipped' : (isOwned ? 'owned' : (!canAfford && !isFree ? 'locked' : ''));

        const costHtml = isFree ? '' : `<div class="item-cost"><span class="cost-stars">\u2B50 ${item.cost}</span></div>`;

        return `
            <div class="shop-item-card ${cardClass}" onclick="handleItemClick('${item.id}')">
                ${previewHtml}
                <div class="item-name">${item.name}</div>
                ${costHtml}
                ${statusHtml}
            </div>
        `;
    }).join('');
}

/**
 * Handle clicking on a shop item
 */
async function handleItemClick(itemId) {
    const item = getAvatarItem(itemId);
    if (!item) return;

    const purchased = childAvatarData.purchased || [];
    const isOwned = purchased.includes(itemId);

    if (isOwned) {
        // Equip the item
        await equipItem(itemId);
    } else {
        // Try to purchase
        await purchaseItem(itemId);
    }
}

/**
 * Purchase an item
 */
async function purchaseItem(itemId) {
    const item = getAvatarItem(itemId);
    if (!item) return;

    const balance = getStarBalance(childAvatarData);
    if (balance < item.cost) {
        showShopToast('Not enough stars! Keep learning to earn more.');
        return;
    }

    // Confirm purchase for non-free items
    if (item.cost > 0) {
        if (!confirm(`Buy "${item.name}" for ${item.cost} stars?`)) return;
    }

    // Update local state
    childAvatarData.purchased.push(itemId);
    childAvatarData.starsSpent = (childAvatarData.starsSpent || 0) + item.cost;

    // Auto-equip on purchase
    const category = getItemCategory(itemId);
    const categoryToKey = { characters: 'character', hats: 'hat', frames: 'frame', backgrounds: 'background' };
    const selKey = categoryToKey[category];
    if (selKey) {
        childAvatarData.selected[selKey] = itemId;
    }

    // Save to Firestore
    await saveAvatarData();

    if (typeof playSound === 'function') playSound('complete');
    showShopToast(`"${item.name}" purchased and equipped!`);
    renderShop();
}

/**
 * Equip an owned item
 */
async function equipItem(itemId) {
    const category = getItemCategory(itemId);
    const categoryToKey = { characters: 'character', hats: 'hat', frames: 'frame', backgrounds: 'background' };
    const selKey = categoryToKey[category];

    if (!selKey) return;

    childAvatarData.selected[selKey] = itemId;
    await saveAvatarData();

    if (typeof playSound === 'function') playSound('click');
    renderShop();
}

/**
 * Save avatar data to Firestore
 */
async function saveAvatarData() {
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return;

    try {
        await firebase.firestore().collection('children').doc(child.id).update({
            avatar: childAvatarData
        });
    } catch (error) {
        console.error('Error saving avatar data:', error);
    }
}

/**
 * Show a temporary toast message
 */
function showShopToast(message) {
    let toast = document.getElementById('shop-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'shop-toast';
        toast.className = 'pm-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
