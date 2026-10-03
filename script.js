const getActiveTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
const isVietnamese = () => document.body.classList.contains('lang-vi');
const bilingual = (en, vi) => `<span class="content-en">${en}</span><span class="content-vi">${vi}</span>`;

function updateThemeToggle() {
    const button = document.getElementById('theme-toggle'); if (!button) return;
    const light = getActiveTheme() === 'light';
    button.setAttribute('aria-label', isVietnamese() ? (light ? 'Bật giao diện tối' : 'Bật giao diện sáng') : (light ? 'Switch to dark mode' : 'Switch to light mode'));
    button.setAttribute('aria-pressed', String(light)); button.title = button.getAttribute('aria-label');
}
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
    try { localStorage.setItem('theme-preference', getActiveTheme()); } catch (_) {}
    updateThemeToggle(); document.dispatchEvent(new Event('themechange'));
}
function applyLanguage(language) {
    const vi = language === 'vi';
    document.body.classList.toggle('lang-vi', vi); document.body.classList.toggle('lang-en', !vi);
    document.documentElement.lang = vi ? 'vi' : 'en';
    try { sessionStorage.setItem('portfolio-language', vi ? 'vi' : 'en'); } catch (_) {}
    const button = document.getElementById('lang-toggle');
    button.innerHTML = vi ? 'VI <span aria-hidden="true">/ EN</span>' : 'EN <span aria-hidden="true">/ VI</span>';
    button.setAttribute('aria-label', vi ? 'Switch to English' : 'Switch to Vietnamese');
    document.getElementById('nav-menu').setAttribute('aria-label', vi ? 'Mở menu điều hướng' : 'Open navigation');
    document.querySelector('.display-prefs > summary').setAttribute('aria-label', vi ? 'Cài đặt chuyển động' : 'Animation settings');
    updateThemeToggle(); renderFiles(currentPath, projectPage); renderAchievement(activeAchievement);
    const motionSelect = document.getElementById('motion-preference');
    if (motionSelect) ['on','system','off'].forEach((value,index) => {motionSelect.options[index].textContent = vi ? ['Bật','Theo thiết bị','Tắt'][index] : ['On','System','Off'][index];});
    document.dispatchEvent(new Event('languagechange'));
}
function toggleDetail(element) {
    const open = element.classList.toggle('active'); element.setAttribute('aria-expanded', String(open));
    element.nextElementSibling.style.maxHeight = open ? 'none' : '0px';
}
function motionIsReduced() {
    const preference = document.documentElement.dataset.motionPreference || 'on';
    return preference === 'off' || (preference === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function applyMotionPreference(preference) {
    const valid = ['on','system','off'].includes(preference) ? preference : 'on';
    document.documentElement.dataset.motionPreference = valid;
    document.documentElement.dataset.motion = motionIsReduced() ? 'reduced' : 'full';
    try { localStorage.setItem('motion-preference',valid); } catch (_) {}
    document.dispatchEvent(new Event('motionchange'));
}

let currentPath = 'AI PROJECTS', projectPage = 0, activeAchievement = 0;
const PROJECT_DESCRIPTIONS = {
    'Light = Die': ['My strongest game project so far.', 'Dự án game tốt nhất của mình hiện tại.'],
    'Ball Eat Balls': ['A game challenge made in one hour.', 'Game thử thách, làm trong một giờ.'],
    'Fruit Ninja': ['Unity tutorial project.', 'Dự án học theo hướng dẫn Unity.'],
    'Lazy Note': ['AI study workspace', 'Ứng dụng học tập với AI'],
    'PlayWeaver': ['AI game prototyping', 'Tạo bản thử nghiệm game bằng AI'],
    'ClinicScribe': ['AI clinical notes', 'Ghi chép hồ sơ khám bệnh bằng AI'],
    'SignBridge AI': ['Sign language ↔ voice', 'Chuyển đổi giữa thủ ngữ và giọng nói'],
    'RecycleCheck AI': ['AI waste sorting', 'Phân loại rác bằng AI'],
    'Soccer Drone': ['FPV drone / Team The Cookies', 'Drone FPV / Nhóm The Cookies'],
    'Hunt for the Moon': ['Interactive moving target', 'Bia di chuyển cho trò chơi bắn mục tiêu'],
    'Zalo Auto Sender': ['Windows messaging automation', 'Tự động gửi tin nhắn trên Windows'],
    'Windows License Checker': ['Windows license utility', 'Công cụ kiểm tra bản quyền Windows'],
    'AILAX': ['Personal AI agent', 'Trợ lý AI cá nhân']
};
const PROJECT_MEDIA = {
    'Light = Die': ['brand/elaxion-banner.webp','projects/icon-game.svg'],
    'Ball Eat Balls': ['brand/elaxion-logo.webp','projects/icon-game.svg'],
    'Fruit Ninja': ['projects/fruit-ninja.jpg','social/unity.svg'],
    'Lazy Note': ['projects/lazy-note.webp','projects/icon-aiNotebook.svg'],
    'PlayWeaver': ['projects/playweaver.webp','projects/icon-ai.svg'],
    'ClinicScribe': ['projects/clinicscribe.webp','projects/clinicscribe-logo.webp'],
    'SignBridge AI': ['projects/signbridgeai.webp','projects/icon-signBridge.svg'],
    'RecycleCheck AI': ['projects/recyclecheck.webp','projects/recyclecheck-logo.webp'],
    'Soccer Drone': ['projects/soccer-drone.webp','projects/icon-robotics.svg'],
    'Hunt for the Moon': ['brand/elaxion-banner.webp','projects/icon-huntMoon.svg'],
    'Zalo Auto Sender': ['brand/elax-avatar.webp','projects/icon-app.svg'],
    'Windows License Checker': ['brand/elax-avatar.webp','projects/icon-app.svg'],
    'AILAX': ['brand/elax-avatar.webp','projects/icon-ailax.svg']
};
function projectItems(folder) {
    return folder === 'ROOT' ? Object.entries(fileSystem).filter(([key]) => key !== 'ROOT').flatMap(([,items]) => items) : fileSystem[folder] || [];
}
function renderFiles(folderName, page = 0) {
    const grid = document.getElementById('file-grid'); if (!grid) return;
    currentPath = folderName;
    const items = projectItems(folderName);
    const size = matchMedia('(max-width: 600px)').matches ? 2 : 4;
    const pages = Math.max(1, Math.ceil(items.length / size));
    projectPage = Math.max(0, Math.min(page, pages - 1));
    grid.replaceChildren();
    items.slice(projectPage * size, (projectPage + 1) * size).forEach(item => {
        const a = document.createElement('a'); a.className = 'project-card'; a.href = item.link;
        a.setAttribute('aria-label', `${item.name}, ${item.tag}`); a.title = `${item.name}, ${item.tag}`;
        if (/^https?:/.test(item.link)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        const media = PROJECT_MEDIA[item.name], description = PROJECT_DESCRIPTIONS[item.name];
        a.innerHTML = `<div class="project-media"><img src="assets/${media[0]}" alt="${item.name} project visual" width="720" height="405" loading="lazy"></div><div class="project-card-info"><img class="project-icon" src="assets/${media[1]}" alt="" width="36" height="36"><div><h3>${item.name}</h3><p>${bilingual(...description)}</p></div><span class="card-arrow" aria-hidden="true">↗</span></div>${item.ribbon ? '<span class="project-award">'+bilingual('Award winner','Đạt giải')+'</span>' : ''}`;
        grid.appendChild(a);
    });
    document.getElementById('item-count').textContent = `${items.length} ${isVietnamese() ? 'dự án' : 'projects'}`;
    document.getElementById('project-page-count').textContent = `${projectPage + 1} / ${pages}`;
    document.getElementById('projects-prev').disabled = projectPage === 0;
    document.getElementById('projects-next').disabled = projectPage === pages - 1;
    document.querySelectorAll('.explorer-cat').forEach(button => {
        const active = button.dataset.folder === folderName;
        button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    document.dispatchEvent(new Event('projectchange'));
}
function renderAchievement(index) {
    const view = document.getElementById('achievement-view'); if (!view) return;
    const template = document.getElementById(`achievement-${index}`); if (!template) return;
    activeAchievement = index;
    const source = template.content;
    const summary = source.querySelector('.achv-summary');
    const description = summary.querySelector('p')?.innerHTML || '';
    const projectLink = summary.querySelector('a')?.getAttribute('href');
    const image = source.querySelector('.proof-cover');
    const rank = ['1st','3rd','04 / 127','Most Creative Idea'][index];
    const viRank = ['Hạng 1','Hạng 3','04 / 127','Ý tưởng sáng tạo nhất'][index];
    view.innerHTML = `<div class="achievement-copy"><p class="achievement-event">${template.dataset.event}</p><h3>${bilingual(rank,viRank)}</h3><p class="achievement-description">${description}</p><div class="achievement-actions"><a class="plain-link" href="${projectLink}">${bilingual('Project details','Chi tiết dự án')} ↗</a><button type="button" class="plain-link" id="award-open">${bilingual('Photos & details','Ảnh & thông tin')} ↗</button></div></div><div class="achievement-photo">${image ? `<img src="${image.getAttribute('src')}" alt="${image.alt}" width="600" height="450" loading="lazy">` : `<img src="assets/projects/${index===2?'playweaver.webp':'clinicscribe-logo.webp'}" alt="${template.dataset.project}" width="600" height="450"><span>${bilingual('Award photos pending','Chưa có ảnh giải thưởng')}</span>`}</div>`;
    document.querySelectorAll('.achievement-tab').forEach(button => {
        const selected = Number(button.dataset.achievement) === index;
        button.classList.toggle('active',selected); button.setAttribute('aria-pressed',String(selected));
    });
    document.getElementById('award-open').addEventListener('click', () => {
        const dialog = document.getElementById('award-dialog');
        document.getElementById('award-dialog-content').replaceChildren(source.cloneNode(true));
        document.querySelectorAll('#award-dialog-content .proof-gallery').forEach(gallery => {gallery.open = true;});
        dialog.showModal(); document.body.classList.add('dialog-open');
        document.dispatchEvent(new Event('awardopen'));
    });
    document.dispatchEvent(new Event('achievementchange'));
}

document.addEventListener('DOMContentLoaded', () => {
    let motion = 'on'; try { motion = localStorage.getItem('motion-preference') || 'on'; } catch (_) {}
    applyMotionPreference(motion);
    const motionSelect = document.getElementById('motion-preference'); motionSelect.value = motion;
    motionSelect.addEventListener('change', () => applyMotionPreference(motionSelect.value));
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => applyMotionPreference(document.documentElement.dataset.motionPreference));
    let language = 'en'; try { language = sessionStorage.getItem('portfolio-language') || 'en'; } catch (_) {}
    applyLanguage(language);
    document.getElementById('lang-toggle').addEventListener('click', () => applyLanguage(isVietnamese() ? 'en' : 'vi'));
    document.getElementById('theme-toggle').addEventListener('click', () => applyTheme(getActiveTheme() === 'dark' ? 'light' : 'dark'));
    document.querySelectorAll('.explorer-cat').forEach(button => button.addEventListener('click', () => renderFiles(button.dataset.folder)));
    document.getElementById('projects-prev')?.addEventListener('click', () => renderFiles(currentPath,projectPage - 1));
    document.getElementById('projects-next')?.addEventListener('click', () => renderFiles(currentPath,projectPage + 1));
    document.querySelectorAll('.achievement-tab').forEach(button => button.addEventListener('click', () => renderAchievement(Number(button.dataset.achievement))));
    matchMedia('(max-width: 600px)').addEventListener('change', () => renderFiles(currentPath));
    const dialog = document.getElementById('award-dialog');
    if (dialog) {
        document.getElementById('award-dialog-close').addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => {document.body.classList.remove('dialog-open');document.getElementById('award-dialog-content').replaceChildren();});
        dialog.addEventListener('click', event => {
            const bounds = dialog.getBoundingClientRect();
            if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
        });
    }
    const menu = document.getElementById('nav-menu');
    function closeMenu(){document.querySelector('.system-nav').classList.remove('nav-open');menu.setAttribute('aria-expanded','false');}
    menu.addEventListener('click', () => {
        const open = document.querySelector('.system-nav').classList.toggle('nav-open'); menu.setAttribute('aria-expanded',String(open));
    });
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event => {if(event.key==='Escape')closeMenu();});
    initProductPreviewSlideshow();
    document.querySelectorAll('.report-row').forEach((row,index) => {
        row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-expanded','false');
        row.nextElementSibling.id=`report-details-${index}`;row.setAttribute('aria-controls',row.nextElementSibling.id);
        row.addEventListener('keydown',event => {if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDetail(row);}});
    });
});

document.addEventListener('error', event => {
    const image=event.target;
    if (!(image instanceof HTMLImageElement) || image.hasAttribute('data-product-preview-image')) return;
    if(image.dataset.fallbackApplied)return;image.dataset.fallbackApplied='1';
    if (image.closest('.project-card') || image.closest('.achievement-photo')) {
        image.src = 'assets/brand/elaxion-banner.webp'; return;
    }
    const placeholder=document.createElement('div');placeholder.className='media-placeholder';
    placeholder.innerHTML=`<span>${bilingual('Image unavailable','Không tải được ảnh')}</span>`;
    if(image.classList.contains('award-slide')) {placeholder.classList.add('award-slide');placeholder.style.display=getComputedStyle(image).display;image.replaceWith(placeholder);}
    else {image.hidden=true;image.after(placeholder);}
}, true);
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
    const placeholderEl = document.createElement('div');
    placeholderEl.className = 'media-placeholder';
    placeholderEl.innerHTML = '<span class="placeholder-mark" aria-hidden="true">↗</span><span class="placeholder-label"><span class="content-en">Images coming soon</span><span class="content-vi">Hình ảnh sẽ được bổ sung</span></span>';
    placeholderEl.hidden = true;
    mediaEl.appendChild(placeholderEl);
    imageEl.addEventListener('error', () => {
        imageEl.hidden = true;
        placeholderEl.hidden = false;
    });

    const slidePresets = {
        lazyNote: [
            {
                type: 'video',
                embedSrc: 'https://www.youtube.com/embed/5lEdb85Zw0w?rel=0&modestbranding=1&playsinline=1',
                captionVi: 'Video giới thiệu sản phẩm.',
                captionEn: 'Product demo video.',
                title: 'Lazy Note product demo video',
                altVi: 'Lazy Note product demo video',
                altEn: 'Lazy Note product demo video'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/TB0CFqgr/gallery.jpg',
                captionVi: 'Trang giới thiệu.',
                captionEn: 'Landing page.',
                altVi: 'Lazy Note landing page preview',
                altEn: 'Lazy Note landing page preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/Lh5fPjgB/gallery.jpg',
                captionVi: 'Tạo ghi chú với giọng văn và cách trả lời của AI theo ý bạn; có thể chỉnh lại sau.',
                captionEn: 'Note creation with custom AI\'s writing tone/persona (customizable later on).',
                altVi: 'Lazy Note note creation preview',
                altEn: 'Lazy Note note creation preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/v4ckWj5J/gallery-1.jpg',
                captionVi: 'Dùng đề mục do AI gợi ý hoặc tự tạo, rồi kéo thả để sắp xếp theo ý bạn. Có thể chỉnh lại sau.',
                captionEn: 'AI-suggested headings or do your own! Drag & Drop them to reorganize to your liking! (customizable later on)',
                altVi: 'Lazy Note heading organization preview',
                altEn: 'Lazy Note heading organization preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/sdyVHHFM/gallery.jpg',
                captionVi: 'Một ghi chú vừa được tạo.',
                captionEn: 'New freshly made note.',
                altVi: 'Lazy Note new note preview',
                altEn: 'Lazy Note new note preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/TMHBvkDD/gallery-1.jpg',
                captionVi: 'AI đánh dấu nội dung quan trọng chỉ bằng một lần bấm. Trình soạn thảo cũng hỗ trợ phần lớn định dạng LaTeX và Markdown do AI tạo.',
                captionEn: 'AI Auto-highlight important stuff for you with just one click! Our note editor also support most AI\'s LaTeX and Markdowns!',
                altVi: 'Lazy Note auto highlight preview',
                altEn: 'Lazy Note auto highlight preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/k6szTpwT/gallery.jpg',
                captionVi: 'Lưu ghi chú trong kho riêng tư. Người dùng đã đăng nhập có thể đồng bộ lên đám mây.',
                captionEn: 'Store your notes in your own private vault! (Cloud-sync available for logged-in users)',
                altVi: 'Lazy Note private vault preview',
                altEn: 'Lazy Note private vault preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/M5fDFh76/gallery.jpg',
                captionVi: 'Đăng nhập để đồng bộ ghi chú lên máy chủ, hoặc dùng ẩn danh và chỉ lưu trong localStorage của trình duyệt.',
                captionEn: 'Log-in to sync your notes to our cloud server, or stay anonymous and only save your notes in your browser\'s localStorage.',
                altVi: 'Lazy Note login sync preview',
                altEn: 'Lazy Note login sync preview'
            },
            {
                type: 'image',
                src: 'https://i.ibb.co/G3N329cz/gallery.jpg',
                captionVi: 'Giao diện tối, có thể bật hoặc tắt trong phần quản lý tài khoản.',
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
                captionVi: 'Trang giới thiệu.',
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
                captionVi: 'Trang giới thiệu.',
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
                captionVi: 'Chỗ dành cho ảnh tổng thể hoặc ảnh thử nghiệm drone.',
                captionEn: 'Placeholder hero render or field photo.',
                altVi: 'Soccer Drone placeholder hero render',
                altEn: 'Soccer Drone placeholder hero render'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/0f172a/c084fc?text=Soccer+Drone+Preview+02',
                captionVi: 'Chỗ dành cho ảnh khung, linh kiện điện tử hoặc màn hình cân chỉnh.',
                captionEn: 'Placeholder frame, electronics, or tuning screenshot.',
                altVi: 'Soccer Drone placeholder electronics preview',
                altEn: 'Soccer Drone placeholder electronics preview'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/111827/fbbf24?text=Soccer+Drone+Preview+03',
                captionVi: 'Chỗ dành cho video thi đấu hoặc ảnh thử nghiệm thực tế.',
                captionEn: 'Placeholder match footage or field testing scene.',
                altVi: 'Soccer Drone placeholder field test preview',
                altEn: 'Soccer Drone placeholder field test preview'
            }
        ],
        recyclecheck: [
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/817/588/datas/gallery.jpg',
                captionVi: 'Kết quả quét phân tích nâng cao với Vision AI và phân đoạn từng vật thể.',
                captionEn: 'Advanced scan result with Vision AI and multi-object segmentation.',
                altVi: 'Ảnh kết quả quét phân tích rác của RecycleCheck AI',
                altEn: 'RecycleCheck AI multi-object scan result preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/817/589/datas/gallery.jpg',
                captionVi: 'Hồ sơ người dùng với Eco-Score và biểu đồ xu hướng Chart.js.',
                captionEn: 'User profile with Eco-Score and Chart.js recycling trend tracking.',
                altVi: 'Ảnh hồ sơ người dùng RecycleCheck AI',
                altEn: 'RecycleCheck AI user profile preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/817/590/datas/gallery.jpg',
                captionVi: 'Câu đố tái chế cá nhân hóa dựa trên lịch sử quét.',
                captionEn: 'Personalized recycling quiz tailored to user scan history.',
                altVi: 'Ảnh câu đố tái chế của RecycleCheck AI',
                altEn: 'RecycleCheck AI personalized quiz preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/817/591/datas/gallery.jpg',
                captionVi: 'Hệ thống danh hiệu và phần thưởng thành tích.',
                captionEn: 'Gamified achievement badges and reward system.',
                altVi: 'Ảnh danh hiệu thành tích của RecycleCheck AI',
                altEn: 'RecycleCheck AI achievements preview'
            },
            {
                type: 'image',
                src: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/817/592/datas/gallery.jpg',
                captionVi: 'RecycleDex: từ điển tra cứu vật liệu lấy cảm hứng từ Pokédex.',
                captionEn: 'RecycleDex: waste & material index inspired by Pokédex.',
                altVi: 'Ảnh RecycleDex của RecycleCheck AI',
                altEn: 'RecycleCheck AI RecycleDex preview'
            }
        ],
        signbridgeai: [
            {
                type: 'image',
                src: '../../images/signbridgeai/Screenshot 2026-09-25 203504.png',
                captionVi: 'Giao diện chính của SignBridge AI: Camera nhận diện cử chỉ VSL/ASL thời gian thực, chuyển ngữ thành giọng nói và từ điển thủ ngữ tích hợp.',
                captionEn: 'SignBridge AI main interface: Real-time VSL/ASL hand gesture recognition camera, voice synthesis, and integrated sign dictionary.',
                altVi: 'Giao diện SignBridge AI nhận diện thủ ngữ',
                altEn: 'SignBridge AI hand gesture recognition interface'
            }
        ],
        huntForTheMoon: [
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/181204/fbbf24?text=Hunt+For+The+Moon+Target+System',
                captionVi: 'Hệ thống bia di chuyển "Săn Trăng": Bố trí ray trượt, puly kéo cáp và tấm bia chủ đề Trung Thu.',
                captionEn: '"Hunt for the Moon" Moving Target System: Linear rail setup, pulley-cord drive, and Mid-Autumn target board.',
                altVi: 'Tổng quan hệ thống bia chuyển động Săn Trăng',
                altEn: 'Hunt for the Moon moving target system overview'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/0c192c/38bdf8?text=Arduino+Uno+%2B+L298N+Hardware+Rig',
                captionVi: 'Cụm điều khiển: Vi điều khiển Arduino Uno kết nối mạch cầu H L298N và động cơ DC giảm tốc JGA25 280RPM.',
                captionEn: 'Control Rig: Arduino Uno microcontroller paired with L298N H-Bridge and JGA25 280RPM DC gear motor.',
                altVi: 'Mạch điều khiển Arduino Uno và L298N',
                altEn: 'Arduino Uno and L298N motor driver electronics rig'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/1e1528/c084fc?text=Joystick+Module+%26+Endstop+Limit+Switches',
                captionVi: 'Module Joystick điều khiển thủ công và công tắc hành trình (Endstop) bảo vệ giới hạn hai đầu hành trình.',
                captionEn: 'Analog Joystick input module for manual control and dual limit switches for boundary overrun safety.',
                altVi: 'Cụm Joystick và công tắc hành trình',
                altEn: 'Joystick module and boundary limit switches'
            },
            {
                type: 'image',
                src: 'https://placehold.co/1600x900/06281e/34d399?text=VinSchool+Booth+Interactive+Exhibition',
                captionVi: 'Gian hàng hội chợ Trung Thu tại VinSchool: Trải nghiệm bắn bia tương tác thu hút đông đảo học sinh tham gia.',
                captionEn: 'VinSchool Mid-Autumn Festival Booth: Interactive target shooting gameplay engaging students.',
                altVi: 'Gian hàng Trung Thu tương tác tại VinSchool',
                altEn: 'Interactive Mid-Autumn festival booth exhibition at VinSchool'
            }
        ]
    };

    const requestedPreset = root.dataset.productPreview && root.dataset.productPreview.trim();
    const slides = slidePresets[requestedPreset] || slidePresets.lazyNote;

    let currentIndex = 0;
    let dotButtons = [];
    let settleTimer = null;

    function getAltText(slide) {
        return document.body.classList.contains('lang-vi') ? slide.altVi : slide.altEn;
    }

    function stopVideoPlayback() {
        mediaEl.classList.remove('is-video-slide');
        videoEl.hidden = true;
        videoEl.removeAttribute('src');
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
        placeholderEl.hidden = true;

        if (slide.type === 'video') {
            mediaEl.classList.add('is-video-slide');
            imageEl.hidden = true;
            videoEl.title = slide.title;
            videoEl.hidden = false;
            videoEl.src = slide.embedSrc;
        } else if (slide.src && slide.src.includes('placehold.co')) {
            imageEl.hidden = true;
            placeholderEl.hidden = false;
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

const fileSystem = {
    "ROOT": [
        { type: 'folder', name: 'GAME PROJECTS' },
        { type: 'folder', name: 'APP PROJECTS' },
        { type: 'folder', name: 'AI PROJECTS' },
        { type: 'folder', name: 'ROBOTICS PROJECTS' },
        { type: 'file', name: 'readme.txt', link: '#', desc: 'hellu :3' }
    ],
    "GAME PROJECTS": [
        { type: 'file', name: 'Light = Die', link: 'https://elaxuwu.itch.io/light-equal-die', tag: 'UNITY 3D', icon: 'game' },
        { type: 'file', name: 'Ball Eat Balls', link: 'https://elaxuwu.itch.io/ball-eat-balls', tag: 'UNITY WEBGL', icon: 'game' },
        { type: 'file', name: 'Fruit Ninja', link: 'https://elaxuwu.github.io/TemuFruitNinja/', tag: 'UNITY WEBGL', icon: 'game' }
    ],
    "APP PROJECTS": [
        { type: 'file', name: 'Zalo Auto Sender', link: 'pages/projects/zalo_auto_sender_page.html', tag: 'WPF/C# AUTOMATION', icon: 'app' },
        { type: 'file', name: 'Windows License Checker', link: 'https://github.com/elaxuwu/Windows-License-Checker---Windows-Crack-Checker', tag: 'WINDOWS UTILITY', icon: 'app' }
    ],
    "AI PROJECTS": [
        { type: 'file', name: 'Lazy Note', icon: 'aiNotebook', link: 'pages/projects/lazy_note.html', tag: 'ADVANCED AI NOTEBOOK', ribbon: 'WINNER' },
        { type: 'file', name: 'PlayWeaver', icon: 'ai', link: 'pages/projects/playweaver.html', tag: 'AI GAME PROTOTYPER', ribbon: 'WINNER' },
        { type: 'file', name: 'ClinicScribe', icon: 'clinicScribe', link: 'pages/projects/clinicscribe.html', tag: 'AI CLINICAL SCRIBE', ribbon: 'WINNER' },
        { type: 'file', name: 'SignBridge AI', icon: 'signBridge', link: 'pages/projects/signbridgeai.html', tag: 'AI SIGN TRANSLATOR' },
        { type: 'file', name: 'AILAX', link: 'https://github.com/elaxuwu/AILAX', tag: 'PERSONAL AI AGENT', icon: 'ailax' },
        { type: 'file', name: 'RecycleCheck AI', link: 'pages/projects/recyclecheck.html', tag: 'AI RECYCLING SCANNER', icon: 'recycle' }
    ],
    "ROBOTICS PROJECTS": [
        { type: 'file', name: 'Soccer Drone', link: 'pages/projects/soccer_drone.html', tag: 'FPV ROBOTICS', icon: 'robotics', ribbon: 'WINNER' },
        { type: 'file', name: 'Hunt for the Moon', link: 'pages/projects/hunt_for_the_moon.html', tag: 'ARDUINO MECHATRONICS', icon: 'huntMoon' }
    ]
};
