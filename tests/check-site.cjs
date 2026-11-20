/* Small, runnable checks of the actual pagination and saved site assets. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'script.js'),'utf8');
let vietnamese=false,mobile=false;
const element=()=>({children:[],attributes:{},appendChild(child){this.children.push(child);},replaceChildren(){this.children=[];},setAttribute(key,value){this.attributes[key]=value;},classList:{toggle(){}}});
const ids=Object.fromEntries(['file-grid','item-count','project-page-count','projects-prev','projects-next'].map(id=>[id,element()]));
const filters=['ROOT','GAME PROJECTS','AI PROJECTS','APP PROJECTS','ROBOTICS PROJECTS'].map(folder=>({...element(),dataset:{folder}}));
const document={body:{classList:{contains:()=>vietnamese}},documentElement:{dataset:{}},addEventListener(){},dispatchEvent(){},createElement:element,getElementById:id=>ids[id],querySelectorAll:()=>filters};
const context=vm.createContext({document,Event:class{},matchMedia:q=>({matches:q.includes('max-width')?mobile:true})});
vm.runInContext(source,context);
function checkResponsiveImages(html, base){
    for(const match of html.matchAll(/srcset="([^"]+)"/g)){
        let lastWidth=0;
        for(const candidate of match[1].split(',')){
            const [url,descriptor]=candidate.trim().split(/\s+/);
            if(/^https?:/.test(url))continue;
            assert(fs.existsSync(path.resolve(base,url)),url);
            if(descriptor){
                assert.match(descriptor,/^\d+w$/);
                const width=parseInt(descriptor,10);
                assert(width>lastWidth,'Responsive widths must increase');
                lastWidth=width;
            }
        }
    }
}
for(const phone of [false,true]){
    mobile=phone;
    const size=phone?2:4;
    for(const [category,total] of [['ROOT',15],['GAME PROJECTS',5],['AI PROJECTS',6],['APP PROJECTS',2],['ROBOTICS PROJECTS',2]]){
        const pages=Math.ceil(total/size),destinations=[];
        for(let page=0;page<pages;page++){
            context.renderFiles(category,page);
            assert.equal(ids['file-grid'].children.length,Math.min(size,total-page*size));
            assert.equal(ids['item-count'].textContent,`${total} projects`);
            assert.equal(ids['project-page-count'].textContent,`${page+1} / ${pages}`);
            assert.equal(ids['projects-prev'].disabled,page===0);
            assert.equal(ids['projects-next'].disabled,page===pages-1);
            assert.equal(filters.find(filter=>filter.dataset.folder===category).attributes['aria-pressed'],'true');
            for(const card of ids['file-grid'].children){
                destinations.push(card.href);
                assert(card.href&&card.href!=='#');
                assert.match(card.innerHTML,/content-en/);assert.match(card.innerHTML,/content-vi/);assert.match(card.innerHTML,/project-icon/);
                for(const match of card.innerHTML.matchAll(/src="([^"]+)"/g))assert(fs.existsSync(path.join(root,match[1])),match[1]);
                checkResponsiveImages(card.innerHTML,root);
                if(!card.href.startsWith('http'))assert(fs.existsSync(path.join(root,card.href)),card.href);
            }
        }
        assert.equal(new Set(destinations).size,total,`Missing or duplicated projects in ${category}`);
        context.renderFiles(category,-1);assert.equal(ids['project-page-count'].textContent,`1 / ${pages}`);
        context.renderFiles(category,999);assert.equal(ids['project-page-count'].textContent,`${pages} / ${pages}`);
    }
}
vietnamese=true;context.renderFiles('GAME PROJECTS');assert.equal(ids['item-count'].textContent,'5 dự án');
assert.match(ids['file-grid'].children[0].innerHTML,/Light = Die/);assert.match(ids['file-grid'].children[1].innerHTML,/one hour/);
assert.equal(context.motionIsReduced(),false,'User requested full animation as the default');
document.documentElement.dataset.motionPreference='system';assert.equal(context.motionIsReduced(),true);
document.documentElement.dataset.motionPreference='off';assert.equal(context.motionIsReduced(),true);
document.documentElement.dataset.motionPreference='on';assert.equal(context.motionIsReduced(),false);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of [path.join(root,'index.html'),path.join(root,'404.html'),...files(path.join(root,'pages')).filter(p=>p.endsWith('.html'))]){
    const html=fs.readFileSync(file,'utf8');
    checkResponsiveImages(html,path.dirname(file));
    assert.match(html,/rel="stylesheet" href="[^"<>]*assets\/dist\/portfolio\.[a-f0-9]{12}\.css"/);
    assert.match(html,/<html lang="en">/);
    if(!file.includes('gradesReport'))assert(!html.includes('gradesReport/'));
    for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
        const url=match[1];if(/^(https?:|mailto:|data:)/.test(url))continue;
        const local=decodeURIComponent(url.split(/[?#]/)[0]);
        if(!local)continue;
        // Root absolute paths are resolved from the site root, not from the page folder.
        const target=local.startsWith('/')?path.join(root,local.slice(1)):path.resolve(path.dirname(file),local);
        assert(fs.existsSync(target),`${file}: ${url}`);
    }
}
for(const file of files(path.join(root,'assets/projects')).filter(p=>p.endsWith('.svg')))assert.match(fs.readFileSync(file,'utf8'),/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.equal((home.match(/<template[^>]+id="achievement-\d"/g)||[]).length,4);
// Award facts use one number format: rank, then space, then total.
for(const fact of ['30 / 217','04 / 127','MOST CREATIVE IDEA'])assert(home.includes(fact),fact);
for(const fact of ['30/217','04/127'])assert(!home.includes(fact),'mixed number format: '+fact);
for(const phrase of ['playground','A few proud moments','world-canvas','scene-light','scene-pause'])assert(!home.includes(phrase),phrase);
assert(!fs.readFileSync(path.join(root,'components.js'),'utf8').includes('✳'));
assert(!fs.readFileSync(path.join(root,'style.css'),'utf8').includes('@import'));
assert.match(fs.readFileSync(path.join(root,'robots.txt'),'utf8'),/^User-agent: \*\nAllow: \/\nDisallow: \/pages\/gradesReport\//);
assert.match(fs.readFileSync(path.join(root,'pages/gradesReport/report_Grade11_Semester1.html'),'utf8'),/name="robots" content="noindex, nofollow"/);
// Privacy, sitemap, error page and security headers.
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
assert.match(robots,/^Sitemap: https:\/\/elaxuwu\.me\/sitemap\.xml$/m);
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert(sitemapUrls.includes('https://elaxuwu.me/'),'Home page must be in the sitemap');
assert(sitemapUrls.includes('https://elaxuwu.me/pages/privacy'),'Privacy page must be in the sitemap');
assert(!sitemapUrls.some(url=>url.includes('gradesReport')),'Private academic report must stay out of the sitemap');
assert(!sitemapUrls.some(url=>url.endsWith('.html')),'Sitemap must use canonical extensionless URLs');
for(const url of sitemapUrls)assert(url.startsWith('https://elaxuwu.me/'),url);
// Every public page listed in the sitemap must declare the same canonical URL.
for(const url of sitemapUrls){
    const file=path.join(root,url.replace('https://elaxuwu.me/','')||'index.html');
    const page=fs.existsSync(file+'.html')?file+'.html':file;
    assert(fs.existsSync(page),`Missing page for sitemap entry ${url}`);
    assert(fs.readFileSync(page,'utf8').includes(`rel="canonical" href="${url}"`),`${url}: canonical tag mismatch`);
}
for(const page of ['index.html','pages/comm_link.html','pages/privacy.html',...files(path.join(root,'pages/projects')).filter(p=>p.endsWith('.html')).map(p=>'pages/projects/'+path.basename(p))]){
    assert(fs.existsSync(path.join(root,page)),page);
}
assert.match(fs.readFileSync(path.join(root,'pages/privacy.html'),'utf8'),/rel="canonical" href="https:\/\/elaxuwu\.me\/pages\/privacy"/);
assert.match(fs.readFileSync(path.join(root,'404.html'),'utf8'),/name="robots" content="noindex, follow"/);
assert.match(fs.readFileSync(path.join(root,'404.html'),'utf8'),/href="\/index\.html"/);
const headers=fs.readFileSync(path.join(root,'_headers'),'utf8');
for(const header of ['Strict-Transport-Security: max-age=63072000; includeSubDomains','X-Content-Type-Options: nosniff','Referrer-Policy: strict-origin-when-cross-origin','X-Frame-Options: SAMEORIGIN','Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()'])assert(headers.includes(header),header);
assert(!/^\/\*[\s\S]*?Cache-Control/m.test(headers.split('\n/*\n')[1]||''),'The catch-all rule must not set Cache-Control and clash with the immutable asset rule');
assert.match(fs.readFileSync(path.join(root,'components.js'),'utf8'),/pages\/privacy\.html/);
// Every YouTube embed must use the privacy enhanced nocookie host.
for(const file of [path.join(root,'index.html'),path.join(root,'script.js'),...files(path.join(root,'pages')).filter(p=>p.endsWith('.html'))]){
    assert(!/youtube\.com\/embed/.test(fs.readFileSync(file,'utf8')),`${file}: raw youtube.com embed found`);
}
assert.match(fs.readFileSync(path.join(root,'script.js'),'utf8'),/youtube-nocookie\.com\/embed/);
console.log('Passed: all 15 projects across desktop/mobile pages, bilingual cards, motion preferences, local assets, 4 complete awards, URL-only academic report, privacy page, sitemap, 404 page, security headers and nocookie video embeds.');
