import * as THREE from 'three';

const canvas = document.getElementById('hero-field');
const host = document.querySelector('.intro');

function createField() {
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42,1,.1,80);
    camera.position.set(0,0,17);
    const field = new THREE.Group(); scene.add(field);
    const color = new THREE.Color(0xa79bea);
    const ringMaterial = new THREE.MeshBasicMaterial({color,transparent:true,opacity:.25});
    const ringGeometry = new THREE.TorusGeometry(3,.014,6,128);
    const rings = new THREE.InstancedMesh(ringGeometry,ringMaterial,3);
    const transform = new THREE.Object3D();
    for(let i=0;i<3;i++) {
        transform.position.set(4.5,-.1,-1);
        transform.rotation.set(.5+i*.55,.35+i*.65,.2+i*.7);
        transform.scale.setScalar(1+i*.13);transform.updateMatrix();rings.setMatrixAt(i,transform.matrix);
    }
    field.add(rings);
    const starGeometry = new THREE.SphereGeometry(.028,4,3);
    const starMaterial = new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65});
    const stars = new THREE.InstancedMesh(starGeometry,starMaterial,90);
    for(let i=0;i<90;i++) {
        const angle=i*2.39996, radius=2.5+Math.sqrt(i/90)*8;
        transform.position.set(Math.cos(angle)*radius+2,Math.sin(angle)*radius*.47,(i%7)-5);
        transform.rotation.set(0,0,0);transform.scale.setScalar(.4+(i%5)*.15);transform.updateMatrix();stars.setMatrixAt(i,transform.matrix);
    }
    field.add(stars);
    const signal = new AbortController(); const options={signal:signal.signal};
    let targetX=0,targetY=0,currentX=0,currentY=0,visible=true,playing=false,lastFrame=0,time=0;
    const reduced = () => typeof window.motionIsReduced === 'function' ? window.motionIsReduced() : matchMedia('(prefers-reduced-motion: reduce)').matches;
    function render(){renderer.render(scene,camera);}
    function frame(now) {
        const delta=Math.min((now-lastFrame)/1000,.05);lastFrame=now;time+=delta;
        const damping=1-Math.exp(-delta*6);
        currentX+=(targetX-currentX)*damping;currentY+=(targetY-currentY)*damping;
        field.rotation.y=currentX*.1;field.rotation.x=currentY*.06;
        field.rotation.z=Math.sin(time*.12)*.025;
        stars.rotation.z=time*.008;
        render();
    }
    function schedule() {
        const next=visible&&!document.hidden&&!reduced();
        if(next!==playing){playing=next;lastFrame=performance.now();renderer.setAnimationLoop(next?frame:null);}
        if(!next){field.rotation.set(0,0,0);render();}
    }
    function resize(){renderer.setSize(host.clientWidth*1.08,host.clientHeight,false);camera.aspect=host.clientWidth*1.08/host.clientHeight;camera.updateProjectionMatrix();render();}
    function theme(){const light=document.documentElement.dataset.theme==='light';ringMaterial.color.setHex(light?0x6c52b2:0xa79bea);starMaterial.color.copy(ringMaterial.color);ringMaterial.opacity=light?.2:.3;render();}
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.05});visibility.observe(host);
    host.addEventListener('pointermove',event=>{if(reduced())return;const rect=host.getBoundingClientRect();targetX=(event.clientX-rect.left)/rect.width*2-1;targetY=(event.clientY-rect.top)/rect.height*2-1;},options);
    host.addEventListener('pointerleave',()=>{targetX=targetY=0;},options);
    document.addEventListener('themechange',theme,options);
    document.addEventListener('motionchange',schedule,options);
    document.addEventListener('visibilitychange',schedule,options);
    window.addEventListener('pageshow',schedule,options);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer.setAnimationLoop(null);canvas.hidden=true;},options);
    window.addEventListener('pagehide',event=>{
        if(event.persisted){renderer.setAnimationLoop(null);playing=false;return;}
        signal.abort();resizeObserver.disconnect();visibility.disconnect();renderer.setAnimationLoop(null);
        rings.dispose();stars.dispose();ringGeometry.dispose();starGeometry.dispose();ringMaterial.dispose();starMaterial.dispose();renderer.dispose();renderer.forceContextLoss();
    },options);
    theme();resize();schedule();
}
if(canvas&&host){try{createField();}catch(_){canvas.hidden=true;}}
