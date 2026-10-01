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
for(const phone of [false,true]){
    mobile=phone;
    const size=phone?2:4;
    for(const [category,total] of [['ROOT',13],['GAME PROJECTS',3],['AI PROJECTS',6],['APP PROJECTS',2],['ROBOTICS PROJECTS',2]]){
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
                if(!card.href.startsWith('http'))assert(fs.existsSync(path.join(root,card.href)),card.href);
            }
        }
        assert.equal(new Set(destinations).size,total,`Missing or duplicated projects in ${category}`);
        context.renderFiles(category,-1);assert.equal(ids['project-page-count'].textContent,`1 / ${pages}`);
        context.renderFiles(category,999);assert.equal(ids['project-page-count'].textContent,`${pages} / ${pages}`);
    }
}
vietnamese=true;context.renderFiles('GAME PROJECTS');assert.equal(ids['item-count'].textContent,'3 dự án');
assert.match(ids['file-grid'].children[0].innerHTML,/Light = Die/);assert.match(ids['file-grid'].children[1].innerHTML,/one hour/);
assert.equal(context.motionIsReduced(),false,'User requested full animation as the default');
document.documentElement.dataset.motionPreference='system';assert.equal(context.motionIsReduced(),true);
document.documentElement.dataset.motionPreference='off';assert.equal(context.motionIsReduced(),true);
document.documentElement.dataset.motionPreference='on';assert.equal(context.motionIsReduced(),false);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of [path.join(root,'index.html'),...files(path.join(root,'pages')).filter(p=>p.endsWith('.html'))]){
    const html=fs.readFileSync(file,'utf8');
    assert.match(html,/<html lang="en">/);
    if(!file.includes('gradesReport'))assert(!html.includes('gradesReport/'));
    for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
        const url=match[1];if(/^(https?:|mailto:|data:)/.test(url))continue;
        const local=decodeURIComponent(url.split(/[?#]/)[0]);
        if(local)assert(fs.existsSync(path.resolve(path.dirname(file),local)),`${file}: ${url}`);
    }
}
for(const file of files(path.join(root,'assets/projects')).filter(p=>p.endsWith('.svg')))assert.match(fs.readFileSync(file,'utf8'),/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.equal((home.match(/<template[^>]+id="achievement-\d"/g)||[]).length,4);
for(const fact of ['30/217','04/127','MOST CREATIVE IDEA'])assert(home.includes(fact),fact);
for(const phrase of ['playground','A few proud moments','world-canvas','scene-light','scene-pause'])assert(!home.includes(phrase),phrase);
assert(!fs.readFileSync(path.join(root,'components.js'),'utf8').includes('✳'));
assert.match(fs.readFileSync(path.join(root,'pages/gradesReport/report_Grade11_Semester1.html'),'utf8'),/name="robots" content="noindex, nofollow"/);
console.log('Passed: all 13 projects across desktop/mobile pages, bilingual cards, motion preferences, local assets, 4 complete awards, and URL-only academic report.');
