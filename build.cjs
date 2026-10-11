const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const output = path.join(root, 'assets/dist');
fs.mkdirSync(output, { recursive: true });
function emit(name, bytes) {
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    const ext = path.extname(name);
    const filename = path.basename(name, ext) + '.' + hash + ext;
    fs.writeFileSync(path.join(output, filename), bytes);
    return 'assets/dist/' + filename;
}
function htmlFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
    });
}
async function main() {
    const replacements = {};
    for (const file of ['hero-scene.js', 'motion.js', 'components.js', 'script.js', 'style.css']) {
        const result = await esbuild.build({ entryPoints: [path.join(root, file)], bundle: file === 'hero-scene.js' || file === 'motion.js', minify: true, write: false, format: file === 'hero-scene.js' || file === 'motion.js' ? 'esm' : undefined, tsconfigRaw: {} });
        replacements[file] = emit(file, result.outputFiles[0].contents);
    }
    let fonts = fs.readFileSync(path.join(root, 'assets/fonts/portfolio.css'), 'utf8');
    fonts = fonts.replace(/url\(([^)]+\.woff2)\)/g, (_, file) => {
        const url = emit(file, fs.readFileSync(path.join(root, 'assets/fonts', file)));
        replacements[file] = url;
        return 'url(' + path.basename(url) + ')';
    });
    replacements['portfolio.css'] = emit('portfolio.css', (await esbuild.transform(fonts, { loader: 'css', minify: true })).code);
    for (const file of [path.join(root, 'index.html'), ...htmlFiles(path.join(root, 'pages'))]) {
        const prefix = '../'.repeat(path.relative(root, file).split(path.sep).length - 1);
        const html = fs.readFileSync(file, 'utf8').replace(/(src|href)="([^"<>]+)"/g, (match, attr, url) => {
            const clean = url.split('?')[0];
            if (!/^(?:\.\.\/)*(?:(?:assets\/dist\/)|(?:assets\/fonts\/)|(?:assets\/))?(?:hero-scene|motion|components|script|style|portfolio(?:-\d+)?)(?:\.[a-f0-9]{12})?\.(?:js|css|woff2)$/.test(clean)) return match;
            const name = path.posix.basename(clean).replace(/\.[a-f0-9]{12}(?=\.)/, '');
            return replacements[name] ? attr + '="' + prefix + replacements[name] + '"' : match;
        });
        fs.writeFileSync(file, html);
    }
    // Keep previous hashes available for visitors with an older HTML document.
    fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(replacements, null, 2) + '\n');
    console.log('Built minified scripts/styles/fonts with content hashes.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
