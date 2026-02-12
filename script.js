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

    // --- A. BOOT SEQUENCE ---
    const logBox = document.getElementById('boot-log');
    const fill = document.getElementById('boot-fill');
    const percent = document.getElementById('boot-percent');
    const loader = document.getElementById('boot-loader');
    
    const logData = [
        "LOADING ELAX_OS_KERNEL...",
        "MOUNTING VIRTUAL_DRIVE/PROJECTS...",
        "INITIALIZING GRAPHICS_ADAPTER...",
        "ESTABLISHING SECURE_CONNECTION...",
        "LOADING SKILLS_MODULE...",
        "SYSTEM CHECK: OK",
        "ACCESS GRANTED: WELCOME ADMINISTRATOR"
    ];

    if (loader) {
        let p = 0;
        let lIndex = 0;

        const interval = setInterval(() => {
            p += Math.floor(Math.random() * 7) + 2;
            if (p > 100) p = 100;
            
            fill.style.width = p + "%";
            percent.innerText = p + "%";

            if (p > (lIndex * 15) && lIndex < logData.length) {
                const line = document.createElement('div');
                line.innerText = "> " + logData[lIndex];
                logBox.appendChild(line);
                lIndex++;
            }

            if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('loaded-complete');
                    setTimeout(() => loader.remove(), 800);
                    // Start slogan after boot
                    typeWriterEffect(); 
                }, 500);
            }
        }, 100);
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
        alert(">> SYSTEM OVERRIDE: GOD MODE ACTIVATED");
        if(cmdLine) cmdLine.innerText = ">> ROOT_ACCESS_GRANTED";
        
        // START THE RAIN
        if(matrixInterval) clearInterval(matrixInterval);
        if(canvas && ctx) matrixInterval = setInterval(drawMatrix, 50);

    } else {
        if(cmdLine) cmdLine.innerText = ">> USER_MODE_RESTORED";
        
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

// 1. DATA STRUCTURE (Edit your projects here)
const fileSystem = {
    "ROOT": [
        { type: 'folder', name: 'GAME PROJECTS', icon: '📁' },
        { type: 'folder', name: 'APP PROJECTS', icon: '📁' },
        { type: 'folder', name: 'AI PROJECTS', icon: '📁' },
        { type: 'file', name: 'readme.txt', icon: '📄', link: '#', desc: 'Welcome to Elax OS' }
    ],
    "GAME PROJECTS": [
        { 
            type: 'file', 
            name: 'Fruit_Ninja.exe', 
            icon: '🎮', 
            link: 'https://elaxuwu.github.io/TemuFruitNinja/', 
            tag: 'UNITY WEBGL' 
        },
        // Add more games here
    ],
    "APP PROJECTS": [
        { 
            type: 'file', 
            name: 'Zalo_Sender.app', 
            icon: '🔧', 
            link: 'pages/projects/zalo_auto_sender_page.html', 
            tag: 'WPF/C#' 
        }
    ],
    "AI PROJECTS": [
        { 
            type: 'file', 
            name: 'AI-LAX.py', 
            icon: '🧠', 
            link: 'https://github.com/elaxuwu/AILAX', 
            tag: 'PYTHON' 
        }
    ]
};

// 2. STATE MANAGEMENT
let currentPath = "ROOT";
const gridEl = document.getElementById('file-grid');
const pathEl = document.getElementById('current-path');
const countEl = document.getElementById('item-count');

// 3. RENDER FUNCTION
function renderFiles(folderName) {
    if (!gridEl) return;
    
    // Clear current grid
    gridEl.innerHTML = '';
    
    // Get data
    const items = fileSystem[folderName] || [];
    
    // Update UI Elements
    currentPath = folderName;
    if(pathEl) pathEl.innerText = currentPath;
    if(countEl) countEl.innerText = `${items.length} OBJECTS`;

    // Create Icons
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'icon-container';
        div.onclick = () => handleItemClick(item);

        const iconDisplay = document.createElement('div');
        iconDisplay.className = 'icon-img';
        iconDisplay.innerText = item.icon;

        const label = document.createElement('div');
        label.className = 'icon-label';
        label.innerText = item.name;

        div.appendChild(iconDisplay);
        div.appendChild(label);

        if(item.tag) {
            const tag = document.createElement('div');
            tag.className = 'icon-tag';
            tag.innerText = item.tag;
            div.appendChild(tag);
        }

        // Animation delay for cool effect
        div.style.animation = "fadeIn 0.3s ease";
        gridEl.appendChild(div);
    });
}

// 4. CLICK HANDLER
function handleItemClick(item) {
    if (item.type === 'folder') {
        // Play sound if you have the playSound function
        if(typeof playSound === "function") playSound('click');
        renderFiles(item.name);
    } else {
        // It's a file
        if (item.link && item.link !== '#') {
            if(typeof playSound === "function") playSound('click');
            window.open(item.link, '_blank');
        } else {
            alert(">> SYSTEM MESSAGE: Access Denied or File Corrupted.");
        }
    }
}

// 5. NAVIGATION UP
function navigateUp() {
    if(typeof playSound === "function") playSound('click');
    if (currentPath !== "ROOT") {
        renderFiles("ROOT");
    }
}

// 6. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly for the boot animation to finish roughly
    setTimeout(() => {
        renderFiles("ROOT");
    }, 1000);
});


