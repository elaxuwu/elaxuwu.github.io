(function () {
    const body = document.body;
    const home = body.dataset.navBack || 'index.html';
    const base = home.replace(/index\.html(?:#.*)?$/, '');
    const isHome = body.classList.contains('portfolio-home');
    const text = (en, vi) => `<span class="content-en">${en}</span><span class="content-vi">${vi}</span>`;
    // One line icon set: 18px grid, 1.5 stroke, no emoji.
    const icon = (paths, extra = '') => `<svg class="ui-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${paths}</svg>`;
    const icons = {
        cosmos: icon('<circle cx="12" cy="12" r="3.2"/><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-24 12 12)"/>'),
        sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>'),
        moon: icon('<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z"/>'),
        sliders: icon('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>')
    };
    const nav = document.querySelector('.system-nav');
    if (nav) {
        nav.setAttribute('aria-label', 'Main navigation');
        nav.innerHTML = `<a class="brand-identity" href="${isHome ? '#intro' : home}" aria-label="Elax home"><img src="${base}assets/responsive/elax-avatar-96.webp" srcset="${base}assets/responsive/elax-avatar-64.webp 64w, ${base}assets/responsive/elax-avatar-96.webp 96w, ${base}assets/responsive/elax-avatar-144.webp 144w, ${base}assets/brand/elax-avatar.webp 900w" sizes="(max-width: 767px) 34px, 42px" decoding="async" alt="Elax personal brand" width="42" height="42"><span>Elax</span></a>
            <div class="nav-links" id="nav-links">
                <a href="${isHome ? '' : home}#work">${text('Selected Work', 'Dự án tiêu biểu')}</a>
                <a href="${isHome ? '' : home}#recognition">${text('Achievements', 'Thành tích')}</a>
                <a href="${isHome ? '' : home}#about">${text('About', 'Về mình')}</a>
                <a href="${isHome ? '' : home}#contact">${text('Contact', 'Liên hệ')}</a>
            </div>
            <div class="nav-controls"><button id="lang-toggle" type="button" aria-label="EN / VI: Switch to Vietnamese">EN <span aria-hidden="true">/ VI</span></button><button id="theme-toggle" type="button" aria-label="Switch to light mode"><span class="icon-light">${icons.sun}</span><span class="icon-dark">${icons.moon}</span></button><details class="display-prefs"><summary aria-label="Animation settings">${icons.sliders}</summary><label>${text('Animations','Chuyển động')}<select id="motion-preference"><option value="on">On</option><option value="system">System</option><option value="off">Off</option></select></label></details><button id="nav-menu" type="button" aria-label="Open navigation" aria-controls="nav-links" aria-expanded="false"><span></span><span></span></button></div>`;
    }
    const skip = document.createElement('a'); skip.className = 'skip-link'; skip.href = '#main';
    skip.innerHTML = text('Skip to content', 'Đến nội dung'); body.prepend(skip);
    const main = document.querySelector('main'); if (main) main.id = 'main';
    const footer = document.querySelector('.system-footer');
    if (footer) footer.innerHTML = `<p>${body.dataset.footerLine2 || 'Đỗ Ngọc Thiên Bảo (Elax) | 2026'}</p><div class="footer-links"><a href="${base}pages/privacy.html">${text('Privacy', 'Quyền riêng tư')}</a><a href="#main">${text('Back to top', 'Về đầu trang')} ↑</a></div>`;
}());
