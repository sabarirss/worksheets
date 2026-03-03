/**
 * Operation Explainer — Animated visual explanations for math operations
 *
 * Shows child-friendly emoji-based animations when a child scores 0%
 * and clicks "Show Me How It Works". Covers all 4 operations.
 *
 * Called by: worksheet-generator.js (0% safety net dialog)
 */

function showOperationExplanation(operation) {
    // Remove existing overlay if any
    const existing = document.getElementById('operation-explainer-overlay');
    if (existing) existing.remove();

    const examples = getExamples(operation);
    const opLabel = operation.charAt(0).toUpperCase() + operation.slice(1);

    // Inject styles once
    if (!document.getElementById('explainer-styles')) {
        const style = document.createElement('style');
        style.id = 'explainer-styles';
        style.textContent = `
            .explainer-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); display: flex; align-items: center;
                justify-content: center; z-index: 20000; animation: explainerFadeIn 0.3s ease;
            }
            .explainer-card {
                background: white; border-radius: 20px; padding: 30px; max-width: 500px;
                width: 92%; max-height: 85vh; overflow-y: auto; text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .explainer-card h2 { margin: 0 0 8px; color: #333; font-size: 1.4em; }
            .explainer-card .subtitle { color: #888; margin-bottom: 20px; font-size: 0.95em; }
            .example-box {
                background: #f8f9fa; border-radius: 16px; padding: 20px; margin: 16px 0;
                border: 2px solid #e0e0e0;
            }
            .example-box .emoji-row {
                font-size: 2em; min-height: 60px; display: flex; align-items: center;
                justify-content: center; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;
            }
            .example-box .equation {
                font-size: 1.3em; font-weight: bold; color: #333; margin-top: 8px;
            }
            .emoji-item {
                display: inline-block; opacity: 0;
                animation: emojiAppear 0.3s ease forwards;
            }
            .emoji-group {
                display: inline-flex; gap: 2px; border: 2px dashed #ccc;
                border-radius: 10px; padding: 4px 8px; margin: 0 4px;
                opacity: 0; animation: groupAppear 0.4s ease forwards;
            }
            .emoji-fade-out {
                animation: emojiFadeOut 0.5s ease forwards;
            }
            .explainer-gotit {
                padding: 14px 36px; font-size: 1.1em; background: var(--color-primary-gradient, linear-gradient(135deg, #28a745, #20c997));
                color: white; border: none; border-radius: 12px; cursor: pointer;
                font-weight: bold; margin-top: 20px; box-shadow: 0 4px 15px rgba(40,167,69,0.3);
            }
            @keyframes explainerFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes emojiAppear { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
            @keyframes groupAppear { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes emojiFadeOut { from { opacity: 1; } to { opacity: 0.15; } }
        `;
        document.head.appendChild(style);
    }

    const overlay = document.createElement('div');
    overlay.id = 'operation-explainer-overlay';
    overlay.className = 'explainer-overlay';

    let examplesHTML = '';
    examples.forEach((ex, idx) => {
        examplesHTML += buildExampleHTML(ex, operation, idx);
    });

    overlay.innerHTML = `
        <div class="explainer-card">
            <div style="font-size:2.5em;margin-bottom:10px;">${getOperationIcon(operation)}</div>
            <h2>How ${opLabel} Works</h2>
            <p class="subtitle">Let's learn with pictures!</p>
            ${examplesHTML}
            <button class="explainer-gotit" onclick="document.getElementById('operation-explainer-overlay').remove()">
                Got it!
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function getOperationIcon(op) {
    const icons = { addition: '+', subtraction: '-', multiplication: '\u00d7', division: '\u00f7' };
    return icons[op] || '?';
}

function getExamples(operation) {
    const objects = [
        { emoji: '\ud83c\udf4e', name: 'apples' },
        { emoji: '\u2b50', name: 'stars' },
        { emoji: '\ud83c\udf88', name: 'balloons' }
    ];

    switch (operation) {
        case 'addition':
            return [
                { a: 2, b: 3, obj: objects[0] },
                { a: 4, b: 2, obj: objects[1] },
                { a: 3, b: 5, obj: objects[2] }
            ];
        case 'subtraction':
            return [
                { a: 5, b: 2, obj: objects[0] },
                { a: 4, b: 1, obj: objects[1] },
                { a: 6, b: 3, obj: objects[2] }
            ];
        case 'multiplication':
            return [
                { a: 2, b: 3, obj: objects[0] },
                { a: 3, b: 2, obj: objects[1] },
                { a: 4, b: 2, obj: objects[2] }
            ];
        case 'division':
            return [
                { a: 6, b: 3, obj: objects[0] },
                { a: 8, b: 4, obj: objects[1] },
                { a: 6, b: 2, obj: objects[2] }
            ];
        default:
            return [{ a: 2, b: 3, obj: objects[0] }];
    }
}

function buildExampleHTML(ex, operation, exIndex) {
    const baseDelay = exIndex * 800; // Stagger examples
    let emojiHTML = '';
    let equation = '';
    const sym = { addition: '+', subtraction: '-', multiplication: '\u00d7', division: '\u00f7' };
    const symbol = sym[operation] || '+';

    switch (operation) {
        case 'addition': {
            // Show group A, then +, then group B sliding in, then = result
            const result = ex.a + ex.b;
            for (let i = 0; i < ex.a; i++) {
                emojiHTML += `<span class="emoji-item" style="animation-delay:${baseDelay + i * 100}ms">${ex.obj.emoji}</span>`;
            }
            emojiHTML += `<span class="emoji-item" style="animation-delay:${baseDelay + ex.a * 100}ms;font-size:0.7em"> + </span>`;
            for (let i = 0; i < ex.b; i++) {
                emojiHTML += `<span class="emoji-item" style="animation-delay:${baseDelay + (ex.a + 1 + i) * 100}ms">${ex.obj.emoji}</span>`;
            }
            equation = `${ex.a} ${symbol} ${ex.b} = ${result}`;
            break;
        }
        case 'subtraction': {
            const result = ex.a - ex.b;
            for (let i = 0; i < ex.a; i++) {
                const isFading = i >= result;
                const cls = isFading ? 'emoji-item emoji-fade-out' : 'emoji-item';
                const delay = baseDelay + i * 100;
                const fadeDelay = isFading ? baseDelay + (ex.a + 2) * 100 : 0;
                emojiHTML += `<span class="${cls}" style="animation-delay:${delay}ms${isFading ? ';animation-delay:' + fadeDelay + 'ms' : ''}">${ex.obj.emoji}</span>`;
            }
            equation = `${ex.a} ${symbol} ${ex.b} = ${result}`;
            break;
        }
        case 'multiplication': {
            const result = ex.a * ex.b;
            // Show b groups of a items each
            for (let g = 0; g < ex.b; g++) {
                let groupItems = '';
                for (let i = 0; i < ex.a; i++) {
                    groupItems += `<span class="emoji-item" style="animation-delay:${baseDelay + (g * ex.a + i) * 100}ms">${ex.obj.emoji}</span>`;
                }
                emojiHTML += `<span class="emoji-group" style="animation-delay:${baseDelay + g * ex.a * 100}ms">${groupItems}</span>`;
            }
            equation = `${ex.a} ${symbol} ${ex.b} = ${result}`;
            break;
        }
        case 'division': {
            const result = ex.a / ex.b;
            // Show total, then split into equal groups
            for (let g = 0; g < ex.b; g++) {
                let groupItems = '';
                for (let i = 0; i < result; i++) {
                    groupItems += `<span class="emoji-item" style="animation-delay:${baseDelay + (g * result + i) * 100}ms">${ex.obj.emoji}</span>`;
                }
                emojiHTML += `<span class="emoji-group" style="animation-delay:${baseDelay + g * result * 100}ms">${groupItems}</span>`;
            }
            equation = `${ex.a} ${symbol} ${ex.b} = ${result}`;
            break;
        }
    }

    const eqDelay = baseDelay + 1200;
    return `
        <div class="example-box">
            <div class="emoji-row">${emojiHTML}</div>
            <div class="equation emoji-item" style="animation-delay:${eqDelay}ms">${equation}</div>
        </div>
    `;
}
