/**
 * components.js
 * Injects shared nav and footer HTML into every page.
 *
 * Customise each page by adding data-* attributes to <body>:
 *   data-nav-logo     - logo text shown in the nav (home page only)
 *   data-nav-status   - status badge text
 *   data-nav-back     - relative URL for the "back" link (sub-pages only)
 *   data-footer-line1 - first info line in the footer
 *   data-footer-line2 - second info line in the footer
 */
(function () {
    var body = document.body;
    var d = body.dataset;

    var navLogo = d.navLogo || 'ELAX';
    var navStatus = d.navStatus || 'Online';
    var navBack = d.navBack || '';
    var footerLine1 = d.footerLine1 || '[Secure Connection]';
    var footerLine2 = d.footerLine2 || 'Built by Elax - 2026';

    // -- Navigation ────────────────────────────────────────────────────────
    var nav = document.querySelector('nav.system-nav');
    if (nav) {
        var logoEl;
        if (navBack) {
            logoEl = document.createElement('a');
            logoEl.href = navBack;
            logoEl.className = 'logo';
            logoEl.style.textDecoration = 'none';
            logoEl.style.color = 'var(--text)';
            logoEl.textContent = '← Back';
        } else {
            logoEl = document.createElement('div');
            logoEl.className = 'logo';
            logoEl.textContent = navLogo;
        }

        var statusSpan = document.createElement('span');
        statusSpan.className = 'system-status';
        statusSpan.textContent = navStatus;

        var langBtn = document.createElement('button');
        langBtn.id = 'lang-toggle';
        langBtn.className = 'cmd-btn';
        langBtn.type = 'button';
        langBtn.textContent = 'MODE: EN';

        var themeBtn = document.createElement('button');
        themeBtn.id = 'theme-toggle';
        themeBtn.className = 'cmd-btn theme-toggle';
        themeBtn.type = 'button';
        themeBtn.setAttribute('aria-label', 'Toggle color theme');

        var controls = document.createElement('div');
        controls.className = 'nav-controls';
        controls.appendChild(statusSpan);
        controls.appendChild(langBtn);
        controls.appendChild(themeBtn);

        nav.appendChild(logoEl);
        nav.appendChild(controls);
    }

    // ── Footer ────────────────────────────────────────────────────────────
    var footer = document.querySelector('footer.system-footer');
    if (footer) {
        var sysTime = document.createElement('span');
        sysTime.id = 'sys-time';
        sysTime.textContent = 'TIME: --:--:--';

        var sep = document.createElement('span');
        sep.className = 'separator';
        sep.textContent = '|';

        var sysBat = document.createElement('span');
        sysBat.id = 'sys-battery';
        sysBat.textContent = 'BATTERY: DETECTING...';

        var sysBar = document.createElement('div');
        sysBar.className = 'sys-info-bar';
        sysBar.appendChild(sysTime);
        sysBar.appendChild(sep);
        sysBar.appendChild(sysBat);

        var p1 = document.createElement('p');
        p1.textContent = footerLine1;

        var p2 = document.createElement('p');
        p2.textContent = footerLine2;

        footer.appendChild(sysBar);
        footer.appendChild(p1);
        footer.appendChild(p2);
    }
}());
