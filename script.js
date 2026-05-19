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

const THEME_STORAGE_KEY = 'theme-preference';
const THEME_ICONS = {
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"></path></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>'
};

function getActiveTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function updateThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const theme = getActiveTheme();
    const nextAction = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

    themeBtn.innerHTML = THEME_ICONS[theme];
    themeBtn.setAttribute('aria-label', nextAction);
    themeBtn.setAttribute('title', nextAction);
    themeBtn.dataset.theme = theme;
}

function applyTheme(theme) {
    const activeTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);

    try {
        localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
    } catch (error) {
        // Ignore storage failures and keep the in-memory theme.
    }

    updateThemeToggle();
}

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!document.documentElement.hasAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    updateThemeToggle();

    if (!themeBtn || themeBtn.dataset.bound === '1') return;

    themeBtn.dataset.bound = '1';
    themeBtn.addEventListener('click', () => {
        const nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });
}

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
    } else {
        typeWriterEffect();
    }

    initThemeToggle();

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
    let sharedMouseX = window.innerWidth / 2;
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
                    reticle.style.top = pendingY + 'px';
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
        document.querySelectorAll('.pill-button, .launch-btn, .cmd-btn, .nav-btn, .product-preview-nav')
            .forEach(attachMagnetic);
    }
    scanPillButtons();
    initProductPreviewSlideshow();

    // Single mousemove drives all magnetic buttons
    document.addEventListener('mousemove', () => {
        magneticButtons.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = sharedMouseX - cx;
            const dy = sharedMouseY - cy;
            const nearX = Math.max(0, Math.abs(dx) - rect.width / 2);
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
        for (let x = 0; x < columns; x++) drops[x] = 1;

        // Handle Resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = canvas.width / fontSize;
            drops = []; // Reset drops on resize
            for (let x = 0; x < columns; x++) drops[x] = 1;
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
    if (timeEl) timeEl.innerText = `TIME: ${timeString}`;

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = Math.floor(battery.level * 100);
            const charging = battery.charging ? "[CHG]" : "[BAT]";

            const batEl = document.getElementById('sys-battery');
            if (batEl) {
                batEl.innerText = `PWR: ${level}% ${charging}`;
                if (level < 20 && !battery.charging) {
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
        if (batEl) batEl.innerText = "PWR: EXTERNAL";
    }
}

// --- GOD MODE (MATRIX TRIGGER) ---
function activateGodMode() {
    playSound('click');
    document.body.classList.toggle('god-mode');

    const cmdLine = document.querySelector('.cmd-line');
    const isGod = document.body.classList.contains('god-mode');

    if (isGod) {
        alert("🔓 God Mode Activated - Welcome to the HUD");
        if (cmdLine) cmdLine.innerText = "🔐 Elevated Access Granted";

        // START THE RAIN
        if (matrixInterval) clearInterval(matrixInterval);
        if (canvas && ctx) matrixInterval = setInterval(drawMatrix, 50);

    } else {
        if (cmdLine) cmdLine.innerText = "Standard Mode Restored";

        // STOP THE RAIN
        clearInterval(matrixInterval);
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

}

// --- PRODUCT PREVIEW SLIDESHOW ---
function initProductPreviewSlideshow() {
    const root = document.querySelector('[data-product-preview]');
    if (!root || root.dataset.bound === '1') return;

    const mediaEl = root.querySelector('.product-preview-media');
    const imageEl = root.querySelector('[data-product-preview-image]');
    const videoEl = root.querySelector('[data-product-preview-video]');
    const dotsEl = root.querySelector('[data-product-preview-dots]');
    const captionViEl = root.querySelector('[data-product-preview-caption-vi]');
    const captionEnEl = root.querySelector('[data-product-preview-caption-en]');
    const prevButtons = root.querySelectorAll('[data-product-preview-prev]');
    const nextButtons = root.querySelectorAll('[data-product-preview-next]');

    if (!mediaEl || !imageEl || !videoEl || !dotsEl || !captionViEl || !captionEnEl) return;

    root.dataset.bound = '1';

    const slidePresets = {
        lazyNote: [
            {
                type: 'video',
                embedSrc: 'https://www.youtube.com/embed/5lEdb85Zw0w?rel=0&modestbranding=1&playsinline=1',
                captionVi: 'Product demo video.',
                captionEn: 'Product demo video.',
                title: 'Lazy Note product demo video',
                altVi: 'Lazy Note product demo video',
                altEn: 'Lazy Note product demo video'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/TB0CFqgr/gallery.jpg',
                captionVi: 'Landing page.',
                captionEn: 'Landing page.',
                altVi: 'Lazy Note landing page preview',
                altEn: 'Lazy Note landing page preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/Lh5fPjgB/gallery.jpg',
                captionVi: 'Note creation with custom AI\'s writing tone/persona (customizable later on).',
                captionEn: 'Note creation with custom AI\'s writing tone/persona (customizable later on).',
                altVi: 'Lazy Note note creation preview',
                altEn: 'Lazy Note note creation preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/v4ckWj5J/gallery-1.jpg',
                captionVi: 'AI-suggested headings or do your own! Drag & Drop them to reorganize to your liking! (customizable later on)',
                captionEn: 'AI-suggested headings or do your own! Drag & Drop them to reorganize to your liking! (customizable later on)',
                altVi: 'Lazy Note heading organization preview',
                altEn: 'Lazy Note heading organization preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/sdyVHHFM/gallery.jpg',
                captionVi: 'New freshly made note.',
                captionEn: 'New freshly made note.',
                altVi: 'Lazy Note new note preview',
                altEn: 'Lazy Note new note preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/TMHBvkDD/gallery-1.jpg',
                captionVi: 'AI Auto-highlight important stuff for you with just one click! Our note editor also support most AI\'s LaTeX and Markdowns!',
                captionEn: 'AI Auto-highlight important stuff for you with just one click! Our note editor also support most AI\'s LaTeX and Markdowns!',
                altVi: 'Lazy Note auto highlight preview',
                altEn: 'Lazy Note auto highlight preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/k6szTpwT/gallery.jpg',
                captionVi: 'Store your notes in your own private vault! (Cloud-sync available for logged-in users)',
                captionEn: 'Store your notes in your own private vault! (Cloud-sync available for logged-in users)',
                altVi: 'Lazy Note private vault preview',
                altEn: 'Lazy Note private vault preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/M5fDFh76/gallery.jpg',
                captionVi: 'Log-in to sync your notes to our cloud server, or stay anonymous and only save your notes in your browser\'s localStorage.',
                captionEn: 'Log-in to sync your notes to our cloud server, or stay anonymous and only save your notes in your browser\'s localStorage.',
                altVi: 'Lazy Note login sync preview',
                altEn: 'Lazy Note login sync preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/G3N329cz/gallery.jpg',
                captionVi: 'Dark mode theme (can toggle in Account Center)',
                captionEn: 'Dark mode theme (can toggle in Account Center)',
                altVi: 'Lazy Note dark mode preview',
                altEn: 'Lazy Note dark mode preview'
            }
        ],
        playweaver: [
            {
                type: 'video',
                embedSrc: 'https://www.youtube.com/embed/y-FgiJwzyMM?rel=0&modestbranding=1&playsinline=1',
                captionVi: 'Video demo ngắn của PlayWeaver.',
                captionEn: 'Short PlayWeaver demo video.',
                title: 'PlayWeaver short demo video',
                altVi: 'Video demo ngắn của PlayWeaver',
                altEn: 'PlayWeaver short demo video'
            },
            {
                type: 'video',
                embedSrc: 'https://www.youtube.com/embed/qRDpVFFkwbc?rel=0&modestbranding=1&playsinline=1',
                captionVi: 'Video demo đầy đủ của PlayWeaver.',
                captionEn: 'Full PlayWeaver demo video.',
                title: 'PlayWeaver full demo video',
                altVi: 'Video demo đầy đủ của PlayWeaver',
                altEn: 'PlayWeaver full demo video'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/500/034/datas/gallery.jpg',
                captionVi: 'Trang landing.',
                captionEn: 'Landing page.',
                altVi: 'Ảnh xem trước trang landing của PlayWeaver',
                altEn: 'PlayWeaver landing page preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/500/038/datas/gallery.jpg',
                captionVi: 'Bộ tạo concept game có AI hỗ trợ.',
                captionEn: 'AI-assisted game concept generator.',
                altVi: 'Ảnh xem trước bộ tạo concept game có AI hỗ trợ của PlayWeaver',
                altEn: 'PlayWeaver AI-assisted game concept generator preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/500/051/datas/gallery.jpg',
                captionVi: 'Trang editor với AI assistant, mindmap và khung xem trước prototype.',
                captionEn: 'Editor page with AI assistant, mindmap, and prototype preview.',
                altVi: 'Ảnh xem trước trang editor của PlayWeaver',
                altEn: 'PlayWeaver editor page preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/503/959/datas/gallery.jpg',
                captionVi: 'Prototype Flappy Boy được tạo trong PlayWeaver.',
                captionEn: 'Flappy Boy prototype generated in PlayWeaver.',
                altVi: 'Ảnh xem trước prototype Flappy Boy của PlayWeaver',
                altEn: 'PlayWeaver Flappy Boy prototype preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/500/057/datas/gallery.jpg',
                captionVi: 'Autosave giúp prototype không bị mất.',
                captionEn: 'Autosave keeps prototype work safe.',
                altVi: 'Ảnh xem trước autosave của PlayWeaver',
                altEn: 'PlayWeaver autosave preview'
            }
        ],
        clinicscribe: [
            {
                type: 'video',
                embedSrc: 'https://www.youtube.com/embed/vK-qdlXqPTA?rel=0&modestbranding=1&playsinline=1',
                captionVi: 'Video demo ClinicScribe.',
                captionEn: 'ClinicScribe demo video.',
                title: 'ClinicScribe demo video',
                altVi: 'Video demo ClinicScribe',
                altEn: 'ClinicScribe demo video'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/572/910/datas/gallery.jpg',
                captionVi: 'Trang landing.',
                captionEn: 'Landing page.',
                altVi: 'Ảnh xem trước trang landing của ClinicScribe',
                altEn: 'ClinicScribe landing page preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/572/911/datas/gallery.jpg',
                captionVi: 'Ghi chú do AI tạo từ cuộc trò chuyện đã ghi âm.',
                captionEn: 'AI-generated note from recorded conversation(s).',
                altVi: 'Ảnh xem trước ghi chú do AI tạo trong ClinicScribe',
                altEn: 'ClinicScribe AI-generated note preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/575/600/datas/gallery.jpg',
                captionVi: 'Hồ sơ bệnh nhân.',
                captionEn: "Patient's profile.",
                altVi: 'Ảnh xem trước hồ sơ bệnh nhân trong ClinicScribe',
                altEn: 'ClinicScribe patient profile preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/572/923/datas/gallery.jpg',
                captionVi: 'Lưu các lần khám dưới từng hồ sơ bệnh nhân.',
                captionEn: "Save encounters under each patient's profile.",
                altVi: 'Ảnh xem trước lưu lần khám trong ClinicScribe',
                altEn: 'ClinicScribe saved encounters preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/572/929/datas/gallery.jpg',
                captionVi: 'Trợ lý AI hỗ trợ trả lời câu hỏi và có thể chỉnh sửa nội dung ghi chú cho bạn!',
                captionEn: "AI assistant for assisting with questions. It can also edit the note's content for you!",
                altVi: 'Ảnh xem trước trợ lý AI của ClinicScribe',
                altEn: 'ClinicScribe AI assistant preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/572/930/datas/gallery.jpg',
                captionVi: 'Không hiểu một ngôn ngữ? Không sao! Hỗ trợ dịch ghi chú qua 15 ngôn ngữ!',
                captionEn: "Don't understand a language? Not a problem! Note translation support across 15 languages!",
                altVi: 'Ảnh xem trước tính năng dịch của ClinicScribe',
                altEn: 'ClinicScribe translation support preview'
            }
        ],
        soccerDrone: [
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/0b1220/8ec5ff?text=Soccer+Drone+Preview+01',
                captionVi: 'Placeholder hero render or field photo.',
                captionEn: 'Placeholder hero render or field photo.',
                altVi: 'Soccer Drone placeholder hero render',
                altEn: 'Soccer Drone placeholder hero render'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/0f172a/c084fc?text=Soccer+Drone+Preview+02',
                captionVi: 'Placeholder frame, electronics, or tuning screenshot.',
                captionEn: 'Placeholder frame, electronics, or tuning screenshot.',
                altVi: 'Soccer Drone placeholder electronics preview',
                altEn: 'Soccer Drone placeholder electronics preview'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/111827/fbbf24?text=Soccer+Drone+Preview+03',
                captionVi: 'Placeholder match footage or field testing scene.',
                captionEn: 'Placeholder match footage or field testing scene.',
                altVi: 'Soccer Drone placeholder field test preview',
                altEn: 'Soccer Drone placeholder field test preview'
            }
        ]
    };

    const requestedPreset = root.dataset.productPreview && root.dataset.productPreview.trim();
    const slides = slidePresets[requestedPreset] || slidePresets.lazyNote;

    let currentIndex = 0;
    let dotButtons = [];
    let swapTimer = null;
    let settleTimer = null;

    slides.filter(slide => slide.type === 'image').forEach(slide => {
        const preloadedImage = new Image();
        preloadedImage.src = slide.src;
    });

    function getAltText(slide) {
        return document.body.classList.contains('lang-vi') ? slide.altVi : slide.altEn;
    }

    function stopVideoPlayback() {
        mediaEl.classList.remove('is-video-slide');
        videoEl.hidden = true;
        videoEl.src = '';
    }

    function updateDots(index) {
        dotButtons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === index;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    function applySlide(slide, index) {
        captionViEl.textContent = slide.captionVi;
        captionEnEl.textContent = slide.captionEn;
        stopVideoPlayback();

        if (slide.type === 'video') {
            mediaEl.classList.add('is-video-slide');
            imageEl.hidden = true;
            videoEl.title = slide.title;
            videoEl.hidden = false;
            videoEl.src = slide.embedSrc;
        } else {
            imageEl.hidden = false;
            imageEl.src = slide.src;
            imageEl.alt = getAltText(slide);
        }

        updateDots(index);
    }

    function renderSlide(index, options = {}) {
        const normalizedIndex = (index + slides.length) % slides.length;
        const slide = slides[normalizedIndex];

        currentIndex = normalizedIndex;

        if (swapTimer) window.clearTimeout(swapTimer);
        if (settleTimer) window.clearTimeout(settleTimer);

        if (options.immediate) {
            applySlide(slide, currentIndex);
            root.classList.remove('is-transitioning');
            return;
        }

        root.classList.add('is-transitioning');
        applySlide(slide, currentIndex);

        settleTimer = window.setTimeout(() => {
            root.classList.remove('is-transitioning');
        }, 220);
    }

    function stepSlide(direction) {
        renderSlide(currentIndex + direction);
    }

    prevButtons.forEach(button => {
        button.addEventListener('click', () => stepSlide(-1));
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => stepSlide(1));
    });

    root.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepSlide(-1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepSlide(1);
        }
    });

    dotButtons = slides.map((slide, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'product-preview-dot';
        button.setAttribute('aria-label', `Show preview ${index + 1}`);
        button.addEventListener('click', () => renderSlide(index));
        dotsEl.appendChild(button);
        return button;
    });

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const currentSlide = slides[currentIndex];
            if (currentSlide.type === 'video') {
                videoEl.title = currentSlide.title;
            } else {
                imageEl.alt = getAltText(currentSlide);
            }
        });
    }

    renderSlide(0, { immediate: true });
}

/* ==========================================================================
   FILE EXPLORER LOGIC
   ========================================================================== */

// SVG icon templates (monochrome, stroke-based)
const ICONS = {
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    game: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h4m-2-2v4"/><circle cx="17" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>`,
    app: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4m-4.5 4.5L12 12l4.5 4.5"/></svg>`,
    robotics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="2.25"/><circle cx="17" cy="7" r="2.25"/><circle cx="7" cy="17" r="2.25"/><circle cx="17" cy="17" r="2.25"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/><path d="M8.7 8.7 10 10"/><path d="M15.3 8.7 14 10"/><path d="M8.7 15.3 10 14"/><path d="M15.3 15.3 14 14"/></svg>`,
    aiNotebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.2"/><path d="M8 3.5v17"/><path d="M10.25 7.5h5.25"/><path d="M10.25 10.75h5.25"/><path d="M10.25 14h3.5"/></svg>`,
    clinicScribe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 4.25h7v-1a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v1z"/><path d="M7.5 4.25h9l.35 1.75H20a1.8 1.8 0 0 1 1.8 1.8v10.1a3.85 3.85 0 0 1-3.85 3.85H6.05a3.85 3.85 0 0 1-3.85-3.85V7.8A1.8 1.8 0 0 1 4 6h3.15l.35-1.75z"/><path d="M12 8.1v3.8"/><path d="M10.1 10h3.8"/><path d="M8 14h8"/><path d="M4.2 17.4h3.7l.9-1.7 1 3.1 1.45-5.05 1.35 6.15 2.1-2.95 1.25 1.15h3.85"/></svg>`,
    ailax: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2v2"/><circle cx="12" cy="2.7" r=".75" fill="currentColor" stroke="none"/><rect x="4.2" y="6" width="15.6" height="12.3" rx="3.2"/><path d="M8 18.3 6.6 21l3.25-2.2"/><path d="M8.2 11.1h.02"/><path d="M15.8 11.1h.02"/><path d="M9 14.3c1.8 1 4.2 1 6 0"/><circle cx="7.8" cy="11.1" r="1.1"/><circle cx="16.2" cy="11.1" r="1.1"/><path d="M9.1 8.15 12 9.7l2.9-1.55"/><path d="M12 9.7v2.45"/><path d="M19.8 9.35h1.65"/><path d="M2.55 9.35H4.2"/><path d="M18.9 5.15l.55-1.35.55 1.35 1.35.55-1.35.55-.55 1.35-.55-1.35-1.35-.55 1.35-.55z"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
};

function getIcon(item) {
    if (item.type === 'folder') return ICONS.folder;
    if (item.icon && ICONS[item.icon]) return ICONS[item.icon];
    const n = item.name.toLowerCase();
    if (n.endsWith('.exe')) return ICONS.game;
    if (n.endsWith('.app')) return ICONS.app;
    if (n.endsWith('.py')) return ICONS.ai;
    return ICONS.file;
}

// 1. DATA STRUCTURE (Edit your projects here)
const fileSystem = {
    "ROOT": [
        { type: 'folder', name: 'GAME PROJECTS' },
        { type: 'folder', name: 'APP PROJECTS' },
        { type: 'folder', name: 'AI PROJECTS' },
        { type: 'folder', name: 'ROBOTICS PROJECTS' },
        { type: 'file', name: 'readme.txt', link: '#', desc: 'hellu :3' }
    ],
    "GAME PROJECTS": [
        { type: 'file', name: 'Fruit Ninja', link: 'https://elaxuwu.github.io/TemuFruitNinja/', tag: 'UNITY WEBGL', icon: 'game' },
    ],
    "APP PROJECTS": [
        { type: 'file', name: 'Zalo Auto Sender', link: 'pages/projects/zalo_auto_sender_page.html', tag: 'WPF/C# AUTOMATION', icon: 'app' }
    ],
    "AI PROJECTS": [
        { type: 'file', name: 'Lazy Note', icon: 'aiNotebook', link: 'pages/projects/lazy_note.html', tag: 'ADVANCED AI NOTEBOOK', ribbon: 'WINNER' },
        { type: 'file', name: 'PlayWeaver', icon: 'ai', link: 'pages/projects/playweaver.html', tag: 'AI GAME PROTOTYPER', ribbon: 'WINNER' },
        { type: 'file', name: 'ClinicScribe', icon: 'clinicScribe', link: 'pages/projects/clinicscribe.html', tag: 'AI CLINICAL SCRIBE' },
        { type: 'file', name: 'AILAX', link: 'https://github.com/elaxuwu/AILAX', tag: 'PERSONAL AI AGENT', icon: 'ailax' }
    ],
    "ROBOTICS PROJECTS": [
        { type: 'file', name: 'Soccer Drone', link: 'pages/projects/soccer_drone.html', tag: 'FPV ROBOTICS', icon: 'robotics', ribbon: 'WINNER' }
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
        if (item.ribbon) div.classList.add('icon-container-featured');
        div.onclick = () => handleItemClick(item);

        if (item.ribbon) {
            const ribbon = document.createElement('div');
            ribbon.className = 'icon-ribbon';
            ribbon.innerText = item.ribbon;
            div.appendChild(ribbon);
        }

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
            window.open(item.link, '_blank', 'noopener,noreferrer');
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


