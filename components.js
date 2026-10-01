(function () {
    const body = document.body;
    const home = body.dataset.navBack || 'index.html';
    const base = home.replace('index.html', '');
    const isHome = body.classList.contains('portfolio-home');
    const text = (en, vi) => `<span class="content-en">${en}</span><span class="content-vi">${vi}</span>`;
    const nav = document.querySelector('.system-nav');
    if (nav) {
        nav.setAttribute('aria-label', 'Main navigation');
        nav.innerHTML = `<a class="brand-identity" href="${isHome ? '#intro' : home}" aria-label="Elax home"><img src="${base}assets/brand/elax-avatar.webp" alt="Elax personal brand" width="42" height="42"><span>Elax</span></a>
            <div class="nav-links" id="nav-links">
                <a href="${isHome ? '' : home}#work">${text('Games', 'Game')}</a>
                <a href="${isHome ? '' : home}#projects">${text('Projects', 'Dự án')}</a>
                <a href="${isHome ? '' : home}#recognition">${text('Achievements', 'Thành tích')}</a>
                <a href="${isHome ? '' : home}#about">${text('About', 'Về mình')}</a>
            </div>
            <div class="nav-controls"><button id="lang-toggle" type="button" aria-label="Switch to Vietnamese">EN <span aria-hidden="true">/ VI</span></button><button id="theme-toggle" type="button" aria-label="Switch to light mode"><span aria-hidden="true">◐</span></button><details class="display-prefs"><summary aria-label="Animation settings">⋯</summary><label>${text('Animations','Chuyển động')}<select id="motion-preference"><option value="on">On</option><option value="system">System</option><option value="off">Off</option></select></label></details><button id="nav-menu" type="button" aria-label="Open navigation" aria-controls="nav-links" aria-expanded="false"><span></span><span></span></button></div>`;
    }
    const skip = document.createElement('a'); skip.className = 'skip-link'; skip.href = '#main';
    skip.innerHTML = text('Skip to content', 'Đến nội dung'); body.prepend(skip);
    const main = document.querySelector('main'); if (main) main.id = 'main';
    const footer = document.querySelector('.system-footer');
    if (footer) footer.innerHTML = `<p>${body.dataset.footerLine2 || 'Đỗ Ngọc Thiên Bảo (Elax) · 2026'}</p><a href="#main">${text('Back to top', 'Về đầu trang')} ↑</a>`;
}());
