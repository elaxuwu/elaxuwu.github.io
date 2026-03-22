/* ==========================================================================
   1. GLOBAL CONFIG & UTILITIES
   (Variables/Functions accessed by HTML or across multiple scopes)
   ========================================================================== */

// Audio Context (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Matrix Rain Global Variables
let canvas, ctx, columns, drops;
let matrixInterval;
const matrixChars = "010101XYZ<>/\\|ELAX_DEV";
const fontSize = 14;

// Typewriter Global Timeout
let typingTimeout;

/** * Report Page Logic (Must be global to work with onclick="toggleDetail(this)") 
 */
function toggleDetail(element) {
    element.classList.toggle('active');
    const detailRow = element.nextElementSibling;

    if (detailRow.style.maxHeight) {
        detailRow.style.maxHeight = null;
    } else {
        detailRow.style.maxHeight = detailRow.scrollHeight + "px";
    }
}

/* ==========================================================================
   2. MAIN INITIALIZATION
   (Runs when the DOM is fully loaded)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // --- A. BOOT SEQUENCE (CREATIVE TERMINAL LOADER) ---
    const loader = document.getElementById('boot-loader');
    const loaderStatus = document.getElementById('loader-status');

    if (loader && loaderStatus) {
        const statusMessages = [
            'INITIALIZING',
            'LOADING MODULES',
            'CONNECTING',
            'READY'
        ];
        let currentStatus = 0;

        // Change status text every 550ms
        const statusInterval = setInterval(() => {
            if (currentStatus < statusMessages.length) {
                loaderStatus.textContent = statusMessages[currentStatus];
                currentStatus++;
            }
        }, 550);

        // Hide loader after 2.2 seconds
        setTimeout(() => {
            clearInterval(statusInterval);
            loader.classList.add('loaded-complete');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 500);
            // Start slogan after boot
            typeWriterEffect();
        }, 2200);
    }

    // --- B. LANGUAGE SWITCHER ---
    const langBtn = document.getElementById('lang-toggle');
    const body = document.body;

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            if (body.classList.contains('lang-en')) {
                body.classList.replace('lang-en', 'lang-vi');
                langBtn.innerText = "MODE: VI";
            } else {
                body.classList.replace('lang-vi', 'lang-en');
                langBtn.innerText = "MODE: EN";
            }
            // System flash effect
            body.style.opacity = "0.7";
            setTimeout(() => body.style.opacity = "1", 50);

            // Sync data-text attribute on glitch headings so hover effect matches active language
            const isVi = body.classList.contains('lang-vi');
            document.querySelectorAll('.glitch-text').forEach(el => {
                const viSpan = el.querySelector('.content-vi');
                const enSpan = el.querySelector('.content-en');
                const activeSpan = isVi ? viSpan : enSpan;
                if (activeSpan) el.setAttribute('data-text', activeSpan.textContent.trim());
            });
            
            // Retype slogan on change
            typeWriterEffect();
        });
    }

    // --- C. UI INTERACTION (Mouse & Scroll) ---
    const glow = document.getElementById('cursor-glow');
    if (glow) {
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }

    // Shared mouse position (updated once, consumed by reticle + lamp + magnetic)
    let sharedMouseX = window.innerWidth  / 2;
    let sharedMouseY = window.innerHeight / 2;
    document.addEventListener('mousemove', (e) => {
        sharedMouseX = e.clientX;
        sharedMouseY = e.clientY;
    });

    // --- C1. MAGNETIC RETICLE CURSOR ---
    (function initReticle() {
        const reticle = document.createElement('div');
        reticle.id = 'cursor-reticle';
        reticle.innerHTML = '<div class="reticle-dot"></div><div class="reticle-ring"></div>';
        document.body.appendChild(reticle);

        let rafPending = false;
        let pendingX = 0, pendingY = 0;

        document.addEventListener('mousemove', (e) => {
            pendingX = e.clientX;
            pendingY = e.clientY;
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    reticle.style.left = pendingX + 'px';
                    reticle.style.top  = pendingY + 'px';
                    rafPending = false;
                });
            }
        });

        function markHoverable() {
            document.querySelectorAll(
                'a, button, [onclick], .sidebar-item, .icon-container, .report-row, .social-node, .launch-btn, .pill-button, .activity-icon, .win-dot'
            ).forEach(el => {
                if (el.dataset.reticleInit) return;
                el.dataset.reticleInit = '1';
                el.addEventListener('mouseenter', () => reticle.classList.add('hovering'));
                el.addEventListener('mouseleave', () => reticle.classList.remove('hovering'));
            });
        }
        markHoverable();

        return markHoverable; // exposed for shared observer below
    })();

    // --- C2. AURORA AMBIENT LIGHT (MOUSE TRACKING) ---
    (function initAuroraLamp() {
        const auroraBg = document.querySelector('.aurora-bg');
        if (!auroraBg) return;

        const lamp = document.createElement('div');
        lamp.className = 'aurora-lamp';
        auroraBg.appendChild(lamp);

        let currentX = sharedMouseX;
        let currentY = sharedMouseY;

        function animateLamp() {
            currentX += (sharedMouseX - currentX) * 0.07;
            currentY += (sharedMouseY - currentY) * 0.07;
            lamp.style.transform = `translate(${currentX - 300}px, ${currentY - 300}px)`;
            requestAnimationFrame(animateLamp);
        }
        animateLamp();
    })();

    // --- C3. MAGNETIC PILL BUTTONS ---
    // Cached rects refreshed only on resize/scroll; single shared mousemove
    const magneticButtons = [];
    const ATTRACT_RADIUS = 20;
    const MAGNET_STRENGTH = 0.35;

    function attachMagnetic(el) {
        if (el.dataset.magneticInit) return;
        el.dataset.magneticInit = '1';
        el.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
        magneticButtons.push(el);
    }

    function scanPillButtons() {
        document.querySelectorAll('.pill-button, .launch-btn, .cmd-btn, .nav-btn')
            .forEach(attachMagnetic);
    }
    scanPillButtons();

    // Single mousemove drives all magnetic buttons
    document.addEventListener('mousemove', () => {
        magneticButtons.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = sharedMouseX - cx;
            const dy = sharedMouseY - cy;
            const nearX = Math.max(0, Math.abs(dx) - rect.width  / 2);
            const nearY = Math.max(0, Math.abs(dy) - rect.height / 2);
            if (Math.hypot(nearX, nearY) <= ATTRACT_RADIUS) {
                el.style.transform = `translate(${dx * MAGNET_STRENGTH}px, ${dy * MAGNET_STRENGTH}px)`;
            } else {
                el.style.transform = '';
            }
        });
    });

    // Single MutationObserver handles both reticle hoverable scan + pill-button scan
    const domObserver = new MutationObserver(() => {
        document.querySelectorAll(
            'a, button, [onclick], .sidebar-item, .icon-container, .report-row, .social-node, .launch-btn, .pill-button, .activity-icon, .win-dot'
        ).forEach(el => {
            if (el.dataset.reticleInit) return;
            el.dataset.reticleInit = '1';
            const reticle = document.getElementById('cursor-reticle');
            if (reticle) {
                el.addEventListener('mouseenter', () => reticle.classList.add('hovering'));
                el.addEventListener('mouseleave', () => reticle.classList.remove('hovering'));
            }
        });
        scanPillButtons();
    });
    domObserver.observe(document.body, { childList: true, subtree: true });

    const hiddenElements = document.querySelectorAll('.hidden-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-section');
            }
        });
    }, { threshold: 0.1 }); 

    hiddenElements.forEach((el) => observer.observe(el));

    // --- D. AUDIO EFFECTS ---
    // Attach sounds to all buttons, links, and report rows
    const interactiveElements = document.querySelectorAll('button, a, .report-row');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('click', () => playSound('click'));
    });

    // --- E. SYSTEM MONITORING ---
    updateSystemStats();
    setInterval(updateSystemStats, 1000);

    // --- F. CHEAT CODE LISTENER (WASD) ---
    const cheatCode = ['w', 'w', 'a', 'a', 's', 's', 'd', 'd'];
    let cheatProgress = 0;

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        if (key === cheatCode[cheatProgress]) {
            cheatProgress++;
            if (cheatProgress === cheatCode.length) {
                activateGodMode();
                cheatProgress = 0; 
            }
        } else {
            cheatProgress = 0; 
        }
    });

    // --- G. MATRIX INITIALIZATION ---
    // Initialize Canvas here to ensure DOM element exists
    canvas = document.getElementById('matrix-bg');
    if (canvas) {
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = canvas.width / fontSize;
        drops = [];
        for(let x = 0; x < columns; x++) drops[x] = 1;
        
        // Handle Resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = canvas.width / fontSize;
            drops = []; // Reset drops on resize
            for(let x = 0; x < columns; x++) drops[x] = 1;
        });
    }
});

/* ==========================================================================
   3. FEATURE LOGIC & HELPERS
   ========================================================================== */

// --- SOUND GENERATOR ---
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
}

// --- TYPEWRITER EFFECT ---
function typeWriterEffect() {
    const sloganElement = document.getElementById('slogan-text');
    if (!sloganElement) return;
    
    const isEnglish = document.body.classList.contains('lang-en');
    const textVi = '"Không có đường tắt nào dẫn đến thành công."';
    const textEn = '"There\'s no shortcut to success."';
    const textToType = isEnglish ? textEn : textVi;
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    sloganElement.innerText = '';
    
    let i = 0;
    function type() {
        if (i < textToType.length) {
            sloganElement.innerText += textToType.charAt(i);
            i++;
            typingTimeout = setTimeout(type, 50); 
        }
    }
    type();
}

// --- SYSTEM STATS ---
function updateSystemStats() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    const timeEl = document.getElementById('sys-time');
    if(timeEl) timeEl.innerText = `TIME: ${timeString}`;

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = Math.floor(battery.level * 100);
            const charging = battery.charging ? "[CHG]" : "[BAT]";
            
            const batEl = document.getElementById('sys-battery');
            if(batEl) {
                batEl.innerText = `PWR: ${level}% ${charging}`;
                if(level < 20 && !battery.charging) {
                    batEl.style.color = 'red';
                    batEl.classList.add('status-blink');
                } else {
                    batEl.style.color = ''; 
                    batEl.classList.remove('status-blink');
                }
            }
        });
    } else {
        const batEl = document.getElementById('sys-battery');
        if(batEl) batEl.innerText = "PWR: EXTERNAL";
    }
}

// --- GOD MODE (MATRIX TRIGGER) ---
function activateGodMode() {
    playSound('click'); 
    document.body.classList.toggle('god-mode'); 
    
    const cmdLine = document.querySelector('.cmd-line');
    const isGod = document.body.classList.contains('god-mode');

    if(isGod) {
        alert("🔓 God Mode Activated - Welcome to the HUD");
        if(cmdLine) cmdLine.innerText = "🔐 Elevated Access Granted";
        
        // START THE RAIN
        if(matrixInterval) clearInterval(matrixInterval);
        if(canvas && ctx) matrixInterval = setInterval(drawMatrix, 50);

    } else {
        if(cmdLine) cmdLine.innerText = "Standard Mode Restored";
        
        // STOP THE RAIN
        clearInterval(matrixInterval);
        if(canvas && ctx) ctx.clearRect(0,0,canvas.width, canvas.height);
    }
}

// --- MATRIX DRAW LOOP ---
function drawMatrix() {
    if (!ctx || !canvas) return;

    // Semi-transparent black trail
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ffff"; // Cyan color
    ctx.font = fontSize + "px monospace";

    for(let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

}

/* ==========================================================================
   FILE EXPLORER LOGIC
   ========================================================================== */

// SVG icon templates (monochrome, stroke-based)
const ICONS = {
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    game:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h4m-2-2v4"/><circle cx="17" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>`,
    app:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    ai:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4m-4.5 4.5L12 12l4.5 4.5"/></svg>`,
    file:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
};

function getIcon(item) {
    if (item.type === 'folder') return ICONS.folder;
    if (item.icon && ICONS[item.icon]) return ICONS[item.icon];
    const n = item.name.toLowerCase();
    if (n.endsWith('.exe')) return ICONS.game;
    if (n.endsWith('.app')) return ICONS.app;
    if (n.endsWith('.py'))  return ICONS.ai;
    return ICONS.file;
}

// 1. DATA STRUCTURE (Edit your projects here)
const fileSystem = {
    "ROOT": [
        { type: 'folder', name: 'GAME PROJECTS' },
        { type: 'folder', name: 'APP PROJECTS' },
        { type: 'folder', name: 'AI PROJECTS' },
        { type: 'file',   name: 'readme.txt',       link: '#',                                         desc: 'Welcome to Elax OS' }
    ],
    "GAME PROJECTS": [
        { type: 'file', name: 'Fruit_Ninja.exe', link: 'https://elaxuwu.github.io/TemuFruitNinja/', tag: 'UNITY WEBGL' }
    ],
    "APP PROJECTS": [
        { type: 'file', name: 'Zalo_Sender.app', link: 'pages/projects/zalo_auto_sender_page.html', tag: 'WPF/C# AUTOMATION' }
    ],
    "AI PROJECTS": [
        { type: 'file', name: 'Lazy Note', icon: 'ai', link: 'pages/projects/lazy_note.html', tag: 'ADVANCED AI NOTEBOOK' },
        { type: 'file', name: 'AI-LAX.py', link: 'https://github.com/elaxuwu/AILAX', tag: 'PERSONAL AI AGENT' }
    ]
};

// 2. STATE MANAGEMENT
let currentPath = "ROOT";
const gridEl = document.getElementById('file-grid');
const countEl = document.getElementById('item-count');

// 3. RENDER FUNCTION
function renderFiles(folderName) {
    if (!gridEl) return;

    gridEl.innerHTML = '';

    const items = fileSystem[folderName] || [];
    currentPath = folderName;
    if (countEl) countEl.innerText = `${items.length} ITEM${items.length !== 1 ? 'S' : ''}`;

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'icon-container';
        div.onclick = () => handleItemClick(item);

        const iconDisplay = document.createElement('div');
        iconDisplay.className = 'icon-img';
        iconDisplay.innerHTML = getIcon(item);

        const label = document.createElement('div');
        label.className = 'icon-label';
        label.innerText = item.name;

        div.appendChild(iconDisplay);
        div.appendChild(label);

        if (item.tag) {
            const tag = document.createElement('div');
            tag.className = 'icon-tag';
            tag.innerText = item.tag;
            div.appendChild(tag);
        }

        div.style.animation = 'fadeIn 0.3s ease';
        gridEl.appendChild(div);
    });
}

// 4. CLICK HANDLER
function handleItemClick(item) {
    if (item.type === 'folder') {
        if (typeof playSound === 'function') playSound('click');
        explorerNav(item.name, null);
    } else {
        if (item.link && item.link !== '#') {
            if (typeof playSound === 'function') playSound('click');
            window.open(item.link, '_blank');
        } else {
            alert('>> SYSTEM MESSAGE: Access Denied or File Corrupted.');
        }
    }
}

// 5. SIDEBAR NAVIGATION
function explorerNav(folder, el) {
    if (typeof playSound === 'function') playSound('click');
    // Update active state on sidebar items
    document.querySelectorAll('.explorer-cat').forEach(c => c.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        // When navigating via folder icon click, match by data-folder attribute
        const match = document.querySelector(`.explorer-cat[data-folder="${CSS.escape(folder)}"]`);
        if (match) match.classList.add('active');
    }
    renderFiles(folder);
}

// 6. NAVIGATE UP (kept for backward compatibility)
function navigateUp() {
    explorerNav('ROOT', document.querySelector('.explorer-cat[data-folder="ROOT"]'));
}

// 6. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly for the boot animation to finish roughly
    setTimeout(() => {
        renderFiles("ROOT");
    }, 1000);
});


