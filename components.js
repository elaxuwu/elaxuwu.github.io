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

    var navLogo     = d.navLogo     || 'ELAX.DEV';
    var navStatus   = d.navStatus   || 'Online';
    var navBack     = d.navBack     || '';
    var footerLine1 = d.footerLine1 || '[Secure Connection]';
    var footerLine2 = d.footerLine2 || 'Built by Elax - 2026';

    // ── Navigation ────────────────────────────────────────────────────────
    var nav = document.querySelector('nav.system-nav');
    if (nav) {
        var logoHtml = navBack
            ? '<a href="' + navBack + '" class="logo" style="text-decoration:none;color:var(--text);">← Back</a>'
            : '<div class="logo">' + navLogo + '</div>';

        nav.innerHTML =
            logoHtml +
            '<div class="nav-controls">' +
                '<span class="system-status">' + navStatus + '</span>' +
                '<button id="lang-toggle" class="cmd-btn">MODE: EN</button>' +
            '</div>';
    }

    // ── Footer ────────────────────────────────────────────────────────────
    var footer = document.querySelector('footer.system-footer');
    if (footer) {
        footer.innerHTML =
            '<div class="sys-info-bar">' +
                '<span id="sys-time">TIME: --:--:--</span>' +
                '<span class="separator">|</span>' +
                '<span id="sys-battery">BATTERY: DETECTING...</span>' +
            '</div>' +
            '<p>' + footerLine1 + '</p>' +
            '<p>' + footerLine2 + '</p>';
    }
}());
