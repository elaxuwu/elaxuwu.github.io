import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function initMotion() {
    let context;
    const reduced = () => window.motionIsReduced?.() ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    const controller=new AbortController();const options={signal:controller.signal};
    function compose() {
        context?.revert();
        context=gsap.context(()=>{
            if(reduced())return;
            if(document.querySelector('.intro')) {
            const intro=gsap.timeline({defaults:{ease:'power3.out'}});
            intro.from('.brand-identity,.nav-links a,.nav-controls',{y:-15,opacity:0,duration:.5,stagger:.035})
                .from('.intro-role',{y:15,opacity:0,duration:.5},.12)
                .from('.headline-line',{y:65,rotationX:12,opacity:0,duration:1.0,stagger:.1},.22)
                .from('.intro-alias,.intro-description,.intro-links',{y:20,opacity:0,duration:.65,stagger:.07},.55)
                .from('.portrait-card',{y:35,rotation:7,scale:.92,opacity:0,duration:1},.35)
                .from('.studio-card',{x:-25,y:30,rotation:-12,opacity:0,duration:.9},.65);
            }
            if(document.querySelector('.case-intro'))gsap.from('.case-intro>*',{y:18,opacity:0,duration:.65,stagger:.055,ease:'power3.out'});
            if(document.querySelector('.case-visual'))gsap.from('.case-visual',{y:30,scale:.95,opacity:0,duration:.9,ease:'power3.out'});
            document.querySelectorAll('.home-section,.project-page .page-section,.social-list-section').forEach(section=>{
                const heading=section.querySelector('h2');
                if(heading)gsap.from(heading,{y:25,opacity:0,duration:.65,ease:'power3.out',scrollTrigger:{trigger:heading,start:'top 92%',toggleActions:'play none none none'}});
            });
            document.querySelectorAll('.game-card').forEach((card,index)=>{
                gsap.from(card,{y:40,opacity:0,duration:.8,delay:index*.06,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 92%',toggleActions:'play none none none'}});
                const image=card.querySelector('.game-visual img');
                if(image)gsap.fromTo(image,{scale:1.08,yPercent:-3},{scale:1.02,yPercent:3,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:.7}});
            });
            document.querySelectorAll('.product-preview-frame').forEach(frame=>{
                gsap.from(frame,{scale:.97,y:20,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:frame,start:'top 92%',toggleActions:'play none none none'}});
            });
            const cards=document.querySelectorAll('#file-grid .project-card');
            if(cards.length)gsap.from(cards,{y:25,opacity:0,stagger:.06,duration:.65,ease:'power3.out',scrollTrigger:{trigger:'#file-grid',start:'top 92%',toggleActions:'play none none none'}});
            if(document.querySelector('.achievements-section'))gsap.from('.achievement-tabs,.achievement-view',{y:22,opacity:0,duration:.7,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:'.achievements-section',start:'top 88%',toggleActions:'play none none none'}});
            if(document.querySelector('.about-section'))gsap.from('.about-head,.skills-list',{y:22,opacity:0,duration:.7,stagger:.05,ease:'power3.out',scrollTrigger:{trigger:'.about-section',start:'top 88%',toggleActions:'play none none none'}});
        },document.body);
        ScrollTrigger.refresh();
    }
    function animateContent(selector) {
        const targets=document.querySelectorAll(selector);if(!targets.length)return;
        gsap.killTweensOf(targets);
        gsap.fromTo(targets,{opacity:0,y:reduced()?0:16},{opacity:1,y:0,stagger:reduced()?0:.04,duration:reduced()?.12:.38,ease:'power3.out',clearProps:'transform,opacity'});
        ScrollTrigger.refresh();
    }
    document.addEventListener('projectchange',()=>animateContent('#file-grid .project-card'),options);
    document.addEventListener('achievementchange',()=>animateContent('.achievement-copy,.achievement-photo'),options);
    document.addEventListener('awardopen',()=>animateContent('#award-dialog .dialog-top,#award-dialog-content'),options);
    document.addEventListener('motionchange',compose,options);
    document.addEventListener('languagechange',()=>ScrollTrigger.refresh(),options);
    document.querySelectorAll('[data-tilt]').forEach(card=>{
        const rx=gsap.quickTo(card,'rotationX',{duration:.65,ease:'power3.out'});
        const ry=gsap.quickTo(card,'rotationY',{duration:.65,ease:'power3.out'});
        let bounds;
        card.addEventListener('pointerenter',()=>{bounds=card.getBoundingClientRect();},options);
        card.addEventListener('pointermove',event=>{
            if(reduced()||!bounds||event.pointerType==='touch')return;
            rx(((event.clientY-bounds.top)/bounds.height-.5)*-8);
            ry(((event.clientX-bounds.left)/bounds.width-.5)*10);
        },options);
        card.addEventListener('pointerleave',()=>{rx(0);ry(0);},options);
    });
    window.addEventListener('pagehide',event=>{
        if(event.persisted)return;
        controller.abort();context?.revert();gsap.killTweensOf('#file-grid .project-card,.achievement-copy,.achievement-photo,#award-dialog .dialog-top,#award-dialog-content,[data-tilt]');ScrollTrigger.getAll().forEach(trigger=>trigger.kill());
    },options);
    compose();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMotion,{once:true});else initMotion();
