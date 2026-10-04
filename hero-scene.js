import * as THREE from 'three';

const canvas = document.getElementById('hero-field');

const CELESTIAL_PROJECTS = [
    {
        id: 'light-equal-die',
        name: 'Light = Die',
        category: 'GAME PROJECTS',
        tag: 'UNITY 3D',
        badge: 'FEATURED',
        orbitIndex: 1,
        orbitRadius: 5.6,
        orbitSpeed: 0.18,
        baseAngle: 0.2,
        inclination: 0.12,
        color: 0xa79bea,
        geometryType: 'sphere',
        radius: 0.52,
        ringRadius: 0.9,
        link: 'https://elaxuwu.itch.io/light-equal-die',
        image: 'assets/brand/elaxion-banner.webp',
        descEn: 'My strongest game project so far. Atmospheric 3D survival game where light is both a weapon and a mortal hazard.',
        descVi: 'Dự án game tốt nhất của mình hiện tại. Trò chơi sinh tồn 3D nơi ánh sáng vừa là vũ khí vừa là hiểm họa.'
    },
    {
        id: 'ball-eat-balls',
        name: 'Ball Eat Balls',
        category: 'GAME PROJECTS',
        tag: 'UNITY WEBGL',
        orbitIndex: 2,
        orbitRadius: 8.2,
        orbitSpeed: 0.14,
        baseAngle: 1.8,
        inclination: -0.15,
        color: 0x38bdf8,
        geometryType: 'sphere',
        radius: 0.38,
        ringRadius: 0.65,
        link: 'https://elaxuwu.itch.io/ball-eat-balls',
        image: 'assets/brand/elaxion-logo.webp',
        descEn: 'A fast-paced multiplayer-inspired game challenge crafted in one hour using Unity WebGL.',
        descVi: 'Game thử thách nhịp độ nhanh lấy cảm hứng từ game ăn bóng, hoàn thành trong một giờ trên Unity WebGL.'
    },
    {
        id: 'fruit-ninja',
        name: 'Fruit Ninja',
        category: 'GAME PROJECTS',
        tag: 'UNITY WEBGL',
        orbitIndex: 2,
        orbitRadius: 9.4,
        orbitSpeed: 0.12,
        baseAngle: 4.2,
        inclination: 0.18,
        color: 0x22c55e,
        geometryType: 'octahedron',
        radius: 0.36,
        link: 'https://elaxuwu.github.io/TemuFruitNinja/',
        image: 'assets/projects/fruit-ninja.jpg',
        descEn: 'Classic fruit slicing recreation with physics-driven blade trails and particle slicing in Unity WebGL.',
        descVi: 'Dự án chém hoa quả kinh điển tái hiện hiệu ứng chém vật lý và hạt hiệu ứng trên Unity WebGL.'
    },
    {
        id: 'lazy-note',
        name: 'Lazy Note',
        category: 'AI PROJECTS',
        tag: 'ADVANCED AI NOTEBOOK',
        badge: 'WINNER',
        orbitIndex: 3,
        orbitRadius: 11.8,
        orbitSpeed: 0.09,
        baseAngle: 0.9,
        inclination: 0.22,
        color: 0xc084fc,
        geometryType: 'icosahedron',
        radius: 0.44,
        ringRadius: 0.74,
        link: 'pages/projects/lazy_note.html',
        image: 'assets/projects/lazy-note.webp',
        descEn: 'AI workspace featuring dynamic personas, audio recording, YouTube synthesis, and visual mindmaps.',
        descVi: 'Không gian ghi chép AI thông minh hỗ trợ tùy biến giọng văn, ghi âm trực tiếp, tóm tắt video và sơ đồ tư duy.'
    },
    {
        id: 'playweaver',
        name: 'PlayWeaver',
        category: 'AI PROJECTS',
        tag: 'AI GAME PROTOTYPER',
        badge: 'WINNER',
        orbitIndex: 3,
        orbitRadius: 12.8,
        orbitSpeed: 0.08,
        baseAngle: 2.6,
        inclination: -0.2,
        color: 0xfbbf24,
        geometryType: 'dodecahedron',
        radius: 0.42,
        link: 'pages/projects/playweaver.html',
        image: 'assets/projects/playweaver.webp',
        descEn: 'Autonomous AI game design and asset pipeline enabling instant playable prototypes from text prompts.',
        descVi: 'Hệ thống AI tự động sinh kịch bản và tài nguyên game, tạo nhanh bản chơi thử từ câu lệnh mô tả.'
    },
    {
        id: 'clinicscribe',
        name: 'ClinicScribe',
        category: 'AI PROJECTS',
        tag: 'AI CLINICAL SCRIBE',
        badge: 'WINNER',
        orbitIndex: 3,
        orbitRadius: 13.8,
        orbitSpeed: 0.075,
        baseAngle: 4.8,
        inclination: 0.16,
        color: 0x06b6d4,
        geometryType: 'octahedron',
        radius: 0.4,
        link: 'pages/projects/clinicscribe.html',
        image: 'assets/projects/clinicscribe.webp',
        descEn: 'Award-winning clinical voice scribe generating structured EHR documentation from doctor-patient dialogue.',
        descVi: 'Ứng dụng AI ghi chép y khoa đạt giải thưởng, tự động chuyển hội thoại bác sĩ bệnh nhân thành hồ sơ bệnh án chuẩn.'
    },
    {
        id: 'signbridge-ai',
        name: 'SignBridge AI',
        category: 'AI PROJECTS',
        tag: 'AI SIGN TRANSLATOR',
        orbitIndex: 3,
        orbitRadius: 14.8,
        orbitSpeed: 0.07,
        baseAngle: 3.7,
        inclination: -0.14,
        color: 0xf472b6,
        geometryType: 'icosahedron',
        radius: 0.35,
        link: 'pages/projects/signbridgeai.html',
        image: 'assets/projects/signbridgeai.webp',
        descEn: 'Two-way computer vision sign language translator bridging deaf and hearing communities in real time.',
        descVi: 'Hệ thống dịch thủ ngữ hai chiều dùng thị giác máy tính giúp kết nối người khiếm thính trong thời gian thực.'
    },
    {
        id: 'recyclecheck-ai',
        name: 'RecycleCheck AI',
        category: 'AI PROJECTS',
        tag: 'AI RECYCLING SCANNER',
        orbitIndex: 3,
        orbitRadius: 15.6,
        orbitSpeed: 0.065,
        baseAngle: 5.5,
        inclination: 0.1,
        color: 0x4ade80,
        geometryType: 'sphere',
        radius: 0.34,
        link: 'pages/projects/recyclecheck.html',
        image: 'assets/projects/recyclecheck.webp',
        descEn: 'AI visual sorting assistant classifying recyclables into proper disposal streams with real-time feedback.',
        descVi: 'Trợ lý phân loại rác thông minh bằng thị giác máy tính hướng dẫn phân loại đúng quy chuẩn.'
    },
    {
        id: 'ailax',
        name: 'AILAX',
        category: 'AI PROJECTS',
        tag: 'PERSONAL AI AGENT',
        orbitIndex: 3,
        orbitRadius: 16.4,
        orbitSpeed: 0.06,
        baseAngle: 2.1,
        inclination: -0.18,
        color: 0xa855f7,
        geometryType: 'octahedron',
        radius: 0.32,
        link: 'https://github.com/elaxuwu/AILAX',
        image: 'assets/brand/elax-avatar.webp',
        descEn: 'Autonomous personal AI agent tailored for workflow automation, productivity, and desktop operations.',
        descVi: 'Trợ lý AI cá nhân tự động hóa quy trình làm việc và hỗ trợ tác vụ máy tính cá nhân.'
    },
    {
        id: 'soccer-drone',
        name: 'Soccer Drone',
        category: 'ROBOTICS PROJECTS',
        tag: 'FPV ROBOTICS',
        badge: 'WINNER',
        orbitIndex: 4,
        orbitRadius: 17.6,
        orbitSpeed: 0.055,
        baseAngle: 1.2,
        inclination: 0.26,
        color: 0xfacc15,
        geometryType: 'probe',
        radius: 0.42,
        ringRadius: 0.82,
        link: 'pages/projects/soccer_drone.html',
        image: 'assets/projects/soccer-drone.webp',
        descEn: 'Aerogreen Hackathon 3rd place FPV quadcopter with custom spherical carbon-fiber roll cage and telemetry.',
        descVi: 'Drone FPV đạt giải 3 Aerogreen Hackathon với khung lồng cầu bảo vệ chống va đập và truyền dữ liệu thời gian thực.'
    },
    {
        id: 'hunt-for-the-moon',
        name: 'Hunt for the Moon',
        category: 'ROBOTICS PROJECTS',
        tag: 'ARDUINO MECHATRONICS',
        orbitIndex: 4,
        orbitRadius: 18.6,
        orbitSpeed: 0.05,
        baseAngle: 3.2,
        inclination: -0.22,
        color: 0xe2e8f0,
        geometryType: 'sphere',
        radius: 0.38,
        ringRadius: 0.72,
        link: 'pages/projects/hunt_for_the_moon.html',
        image: 'assets/brand/elaxion-banner.webp',
        descEn: 'Interactive physical moving target system powered by Arduino and ultrasonic target sensors for shooting games.',
        descVi: 'Hệ thống bia mục tiêu di chuyển cơ điện tử điều khiển bằng Arduino và cảm biến cho trò chơi bắn súng.'
    },
    {
        id: 'zalo-auto-sender',
        name: 'Zalo Auto Sender',
        category: 'APP PROJECTS',
        tag: 'WPF/C# AUTOMATION',
        orbitIndex: 4,
        orbitRadius: 19.6,
        orbitSpeed: 0.045,
        baseAngle: 0.4,
        inclination: 0.15,
        color: 0x60a5fa,
        geometryType: 'satellite',
        radius: 0.3,
        link: 'pages/projects/zalo_auto_sender_page.html',
        image: 'assets/brand/elax-avatar.webp',
        descEn: 'Windows desktop automation utility for high-volume scheduled messaging via Windows UI automation.',
        descVi: 'Công cụ tự động hóa gửi tin nhắn theo lịch trên Windows viết bằng WPF và C#.'
    },
    {
        id: 'windows-license-checker',
        name: 'Windows License Checker',
        category: 'APP PROJECTS',
        tag: 'WINDOWS UTILITY',
        orbitIndex: 4,
        orbitRadius: 20.6,
        orbitSpeed: 0.04,
        baseAngle: 4.5,
        inclination: -0.12,
        color: 0x818cf8,
        geometryType: 'satellite',
        radius: 0.3,
        link: 'https://github.com/elaxuwu/Windows-License-Checker---Windows-Crack-Checker',
        image: 'assets/brand/elax-avatar.webp',
        descEn: 'Lightweight diagnostic tool checking Windows activation status and detecting unauthorized key modifications.',
        descVi: 'Tiện ích kiểm tra tình trạng kích hoạt Windows và phát hiện các can thiệp bản quyền bất thường.'
    }
];

function createField() {
    const isMobile = matchMedia('(max-width: 768px)').matches;
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 95);
    camera.position.set(0, 0, 16);

    const cosmicGroup = new THREE.Group();
    scene.add(cosmicGroup);

    const disposables = [];
    const track = resource => { if (resource) disposables.push(resource); return resource; };

    // Singularity (Black Hole core + Accretion Disk)
    const singularity = new THREE.Group();
    cosmicGroup.add(singularity);
    singularity.position.set(3.6, 0.2, 0);

    // Core event horizon (pitch black cosmic void)
    const coreGeometry = track(new THREE.SphereGeometry(1.28, 24, 24));
    const coreMaterial = track(new THREE.MeshBasicMaterial({ color: 0x090710 }));
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    singularity.add(coreMesh);

    // Inner photon ring
    const photonGeometry = track(new THREE.TorusGeometry(1.36, 0.022, 8, 80));
    const photonMaterial = track(new THREE.MeshBasicMaterial({ color: 0xcfc4ff, transparent: true, opacity: 0.65 }));
    const photonRing = new THREE.Mesh(photonGeometry, photonMaterial);
    photonRing.rotation.x = Math.PI * 0.42;
    singularity.add(photonRing);

    // Accretion disk rings
    const ringColor = new THREE.Color(0xa79bea);
    const ringMaterial = track(new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.35 }));
    const ringGeometries = [
        track(new THREE.TorusGeometry(2.4, 0.03, 6, 100)),
        track(new THREE.TorusGeometry(3.3, 0.024, 6, 120)),
        track(new THREE.TorusGeometry(4.3, 0.018, 6, 120))
    ];
    const ringMeshes = ringGeometries.map((geo, idx) => {
        const ring = new THREE.Mesh(geo, ringMaterial);
        ring.rotation.set(0.48 + idx * 0.08, 0.32 + idx * 0.05, idx * 0.12);
        singularity.add(ring);
        return ring;
    });

    // Vertical gravitational lensing ring
    const lensGeometry = track(new THREE.TorusGeometry(3.1, 0.022, 6, 110));
    const lensMaterial = track(new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.22 }));
    const lensRing = new THREE.Mesh(lensGeometry, lensMaterial);
    lensRing.rotation.set(1.42, 0.2, 0.1);
    singularity.add(lensRing);

    // Pulsar energy ring
    const pulsarGeometry = track(new THREE.TorusGeometry(5.2, 0.016, 6, 90));
    const pulsarMaterial = track(new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.18 }));
    const pulsarRing = new THREE.Mesh(pulsarGeometry, pulsarMaterial);
    pulsarRing.rotation.set(0.65, -0.4, 0.5);
    singularity.add(pulsarRing);

    // Volumetric Starfield with omnidirectional celestial sphere and relativistic warp streaks
    const starCount = isMobile ? 650 : 1350;
    const starGeometry = track(new THREE.CylinderGeometry(0.028, 0.028, 1, 5));
    starGeometry.rotateX(Math.PI / 2);
    const starMaterial = track(new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.72 }));
    const starField = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);
    cosmicGroup.add(starField);

    const starTransform = new THREE.Object3D();
    const starData = [];

    const accretionCount = isMobile ? 120 : 180;
    const corridorCount = isMobile ? 180 : 320;

    for (let i = 0; i < starCount; i++) {
        let x, y, z;
        if (i < accretionCount) {
            // Accretion disk spiral particles near singularity
            const angle = i * 0.19;
            const rad = 1.8 + Math.sqrt(i / accretionCount) * 5.2;
            x = singularity.position.x + Math.cos(angle) * rad;
            y = singularity.position.y + Math.sin(angle) * rad * 0.45;
            z = singularity.position.z + (Math.sin(i * 0.4) * 0.8);
        } else if (i < accretionCount + corridorCount) {
            // Flight corridor stars along Z-axis for normal scroll
            const localIdx = i - accretionCount;
            const spreadRadius = 4 + Math.random() * 16;
            const spreadAngle = Math.random() * Math.PI * 2;
            x = Math.cos(spreadAngle) * spreadRadius;
            y = Math.sin(spreadAngle) * spreadRadius * 0.65;
            z = 18 - (localIdx / corridorCount) * 65 + (Math.random() - 0.5) * 6;
        } else {
            // Omnidirectional celestial sphere wrapping 360 degrees around the cosmos
            const r = 22 + Math.random() * 46;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        }

        const baseScale = 0.32 + (i % 6) * 0.12;
        starData.push({ x, y, z, baseScale });
        starTransform.position.set(x, y, z);
        starTransform.scale.set(baseScale, baseScale, 0.06);
        starTransform.updateMatrix();
        starField.setMatrixAt(i, starTransform.matrix);
    }
    starField.instanceMatrix.needsUpdate = true;

    // Planetary Orbital System attached to Singularity (hidden in normal mode)
    const orbitsGroup = new THREE.Group();
    orbitsGroup.rotation.set(0.24, 0.12, -0.06);
    orbitsGroup.visible = false;
    singularity.add(orbitsGroup);

    // Concentric orbit tracks
    const orbitTrackRadii = [5.6, 8.8, 13.8, 18.8];
    const orbitTrackMat = track(new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    }));

    const orbitTrackMeshes = orbitTrackRadii.map(rad => {
        const trackGeo = track(new THREE.RingGeometry(rad - 0.022, rad + 0.022, 120));
        const trackMesh = new THREE.Mesh(trackGeo, orbitTrackMat);
        trackMesh.rotation.x = Math.PI / 2;
        trackMesh.scale.set(0.2, 0.2, 1);
        orbitsGroup.add(trackMesh);
        return trackMesh;
    });

    // Celestial Bodies Construction
    const celestialBodies = [];
    const hitMeshes = [];

    CELESTIAL_PROJECTS.forEach(proj => {
        const bodyGroup = new THREE.Group();
        bodyGroup.scale.set(0, 0, 0);
        orbitsGroup.add(bodyGroup);

        let geo;
        if (proj.geometryType === 'octahedron') {
            geo = track(new THREE.OctahedronGeometry(proj.radius, 0));
        } else if (proj.geometryType === 'dodecahedron') {
            geo = track(new THREE.DodecahedronGeometry(proj.radius, 0));
        } else if (proj.geometryType === 'icosahedron') {
            geo = track(new THREE.IcosahedronGeometry(proj.radius, 0));
        } else if (proj.geometryType === 'probe') {
            geo = track(new THREE.SphereGeometry(proj.radius * 0.75, 14, 14));
        } else if (proj.geometryType === 'satellite') {
            geo = track(new THREE.BoxGeometry(proj.radius * 1.1, proj.radius * 1.1, proj.radius * 1.1));
        } else {
            geo = track(new THREE.SphereGeometry(proj.radius, 20, 20));
        }

        const coreMat = track(new THREE.MeshBasicMaterial({ color: proj.color, transparent: true, opacity: 0 }));
        const coreMesh = new THREE.Mesh(geo, coreMat);
        bodyGroup.add(coreMesh);

        // Futuristic wireframe shell
        const wireGeo = track(geo.clone());
        wireGeo.scale(1.24, 1.24, 1.24);
        const wireMat = track(new THREE.MeshBasicMaterial({
            color: proj.color,
            wireframe: true,
            transparent: true,
            opacity: 0
        }));
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        bodyGroup.add(wireMesh);

        // Custom planetary accessories
        let accessoryMesh = null;
        let accBaseOpacity = 0.45;
        if (proj.ringRadius) {
            accBaseOpacity = 0.45;
            const accGeo = track(new THREE.RingGeometry(proj.ringRadius * 0.74, proj.ringRadius, 40));
            const accMat = track(new THREE.MeshBasicMaterial({
                color: proj.color,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            }));
            accessoryMesh = new THREE.Mesh(accGeo, accMat);
            accessoryMesh.rotation.x = Math.PI * 0.38;
            bodyGroup.add(accessoryMesh);
        } else if (proj.geometryType === 'probe') {
            accBaseOpacity = 0.55;
            const probeCageGeo = track(new THREE.IcosahedronGeometry(proj.radius * 1.35, 1));
            const probeCageMat = track(new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0
            }));
            const probeCage = new THREE.Mesh(probeCageGeo, probeCageMat);
            bodyGroup.add(probeCage);
            accessoryMesh = probeCage;
        } else if (proj.geometryType === 'satellite') {
            accBaseOpacity = 0.8;
            const panelGeo = track(new THREE.BoxGeometry(proj.radius * 2.6, 0.02, proj.radius * 0.7));
            const panelMat = track(new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0 }));
            const panelMesh = new THREE.Mesh(panelGeo, panelMat);
            bodyGroup.add(panelMesh);
            accessoryMesh = panelMesh;
        }

        // Holographic Target Lock Reticle (billboarded, indicates hover without scaling planet)
        const reticleRadius = Math.max(proj.radius * 1.55, proj.ringRadius ? proj.ringRadius * 1.25 : 0.72);
        const reticleGeo = track(new THREE.RingGeometry(reticleRadius - 0.024, reticleRadius + 0.024, 40));
        const reticleMat = track(new THREE.MeshBasicMaterial({
            color: proj.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0,
            depthWrite: false
        }));
        const reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
        bodyGroup.add(reticleMesh);

        // Invisible generous raycast hit sphere
        const hitGeo = track(new THREE.SphereGeometry(Math.max(proj.radius * 2.4, 1.05), 10, 10));
        const hitMat = track(new THREE.MeshBasicMaterial({ visible: false }));
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = {
            project: proj,
            group: bodyGroup,
            core: coreMesh,
            wire: wireMesh,
            accessory: accessoryMesh
        };
        bodyGroup.add(hitMesh);
        hitMeshes.push(hitMesh);

        celestialBodies.push({
            data: proj,
            group: bodyGroup,
            core: coreMesh,
            wire: wireMesh,
            accessory: accessoryMesh,
            reticle: reticleMesh,
            accBaseOpacity,
            hoverWeight: 0,
            hit: hitMesh
        });
    });

    // Flight Waypoints along scroll corridor
    const waypoints = [
        { p: 0.00, cam: [0, 0, 16], rot: [0, 0, 0], sing: [3.6, 0.2, 0] },
        { p: 0.28, cam: [1.8, -0.6, 6.5], rot: [0.06, -0.14, 0.03], sing: [2.6, -0.4, -0.5] },
        { p: 0.58, cam: [-2.1, 0.4, -6], rot: [-0.05, 0.16, -0.02], sing: [0.6, 0.5, -4] },
        { p: 0.82, cam: [0.8, -0.7, -19], rot: [0.04, -0.07, 0.02], sing: [-1.4, -0.5, -18] },
        { p: 1.00, cam: [0, 0, -32], rot: [0, 0, 0], sing: [0, 0, -32] }
    ];

    function interpolateFlight(progress) {
        const clamped = Math.max(0, Math.min(1, progress));
        let i = 0;
        while (i < waypoints.length - 2 && waypoints[i + 1].p < clamped) {
            i++;
        }
        const w0 = waypoints[i];
        const w1 = waypoints[i + 1];
        const span = w1.p - w0.p;
        const localT = span > 0 ? (clamped - w0.p) / span : 0;
        const smoothT = localT * localT * (3 - 2 * localT);

        return {
            camX: w0.cam[0] + (w1.cam[0] - w0.cam[0]) * smoothT,
            camY: w0.cam[1] + (w1.cam[1] - w0.cam[1]) * smoothT,
            camZ: w0.cam[2] + (w1.cam[2] - w0.cam[2]) * smoothT,
            rotX: w0.rot[0] + (w1.rot[0] - w0.rot[0]) * smoothT,
            rotY: w0.rot[1] + (w1.rot[1] - w0.rot[1]) * smoothT,
            rotZ: w0.rot[2] + (w1.rot[2] - w0.rot[2]) * smoothT,
            singX: w0.sing[0] + (w1.sing[0] - w0.sing[0]) * smoothT,
            singY: w0.sing[1] + (w1.sing[1] - w0.sing[1]) * smoothT,
            singZ: w0.sing[2] + (w1.sing[2] - w0.sing[2]) * smoothT
        };
    }

    // State & Interactive Damping
    const signal = new AbortController();
    const options = { signal: signal.signal };

    let targetProgress = 0;
    let currentProgress = 0;
    let currentCamX = 0, currentCamY = 0, currentCamZ = 16;
    let currentRotX = 0, currentRotY = 0, currentRotZ = 0;
    let currentSingX = 3.6, currentSingY = 0.2, currentSingZ = 0;
    let targetVelocity = 0;
    let currentVelocity = 0;
    let lastWarp = 0.06;
    let targetPointerX = 0, targetPointerY = 0;
    let currentPointerX = 0, currentPointerY = 0;
    let visible = true, playing = false, lastFrame = 0, clockTime = 0;

    // 3D Cosmos Mode Orbit & Inspection State
    let cosmosMode = false;
    let cosmosTransition = 0;
    let targetCosmosTransition = 0;
    let currentOrbitRadius = 26, targetOrbitRadius = 26;
    let currentOrbitTheta = 0.35, targetOrbitTheta = 0.35;
    let currentOrbitPhi = 1.15, targetOrbitPhi = 1.15;
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    let selectedOrb = null;
    let hoveredBody = null;

    // Quaternion math helpers
    const normalEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    const normalQuat = new THREE.Quaternion();
    const cosmosQuat = new THREE.Quaternion();
    const lookAtMatrix = new THREE.Matrix4();
    const upVector = new THREE.Vector3(0, 1, 0);
    const tempCamPos = new THREE.Vector3();
    const tempOrbPos = new THREE.Vector3();

    const reduced = () => typeof window.motionIsReduced === 'function' ? window.motionIsReduced() : matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Public controller for ScrollTrigger sync
    window.cosmicFlight = {
        setProgress(progress, velocity = 0) {
            if (cosmosMode) return;
            targetProgress = Math.max(0, Math.min(1, progress));
            targetVelocity = Math.min(Math.abs(velocity) / 600, 3.5);
        }
    };

    function render() {
        renderer.render(scene, camera);
    }

    function frame(now) {
        const delta = Math.min((now - lastFrame) / 1000, 0.05);
        lastFrame = now;
        clockTime += delta;

        // Cosmos mode transition blend (0 = normal flight, 1 = cosmos mode)
        const transDamping = 1 - Math.exp(-delta * 4.8);
        cosmosTransition += (targetCosmosTransition - cosmosTransition) * transDamping;

        // Visibility and Organic Gravitational Accretion Transition
        if (cosmosTransition <= 0.002 && targetCosmosTransition === 0) {
            orbitsGroup.visible = false;
        } else {
            orbitsGroup.visible = true;

            const isLightTheme = document.documentElement.dataset.theme === 'light';
            const baseTrackOp = isLightTheme ? 0.24 : 0.16;
            orbitTrackMat.opacity = baseTrackOp * Math.max(0, (cosmosTransition - 0.08) / 0.92);

            orbitTrackMeshes.forEach((mesh, idx) => {
                const ringRawT = Math.max(0, Math.min(1, (cosmosTransition - idx * 0.08) / 0.65));
                const ringT = ringRawT * ringRawT * (3 - 2 * ringRawT);
                const ringScale = 0.2 + 0.8 * ringT;
                mesh.scale.set(ringScale, ringScale, 1);
            });

            // Animate Celestial Planetary Orbits around Black Hole
            for (let i = 0; i < celestialBodies.length; i++) {
                const cb = celestialBodies[i];
                const d = cb.data;

                // Emergence staggered by orbit tier: inner orbit 1 blooms first, outer orbit 4 blooms last
                const tierDelay = (d.orbitIndex - 1) * 0.11;
                const rawT = Math.max(0, Math.min(1, (cosmosTransition - tierDelay) / 0.62));
                const transT = rawT * rawT * (3 - 2 * rawT);

                // Interpolate radius: emerges from singularity event horizon boundary (1.35) out to designated orbit
                const activeRadius = 1.35 + (d.orbitRadius - 1.35) * transT;

                const angle = d.baseAngle + clockTime * d.orbitSpeed;
                const x = Math.cos(angle) * activeRadius;
                const z = Math.sin(angle) * activeRadius;
                const y = Math.sin(angle * 2 + d.baseAngle) * (activeRadius * d.inclination);
                cb.group.position.set(x, y, z);

                // Hover response damping (HUD reticle + wire flare, no scale jumping)
                const isHovered = hoveredBody && hoveredBody.project.id === d.id;
                const targetWeight = isHovered ? 1 : 0;
                cb.hoverWeight += (targetWeight - cb.hoverWeight) * (1 - Math.exp(-delta * 9));

                // Pure transT scale: strictly 1.0 when active, zero hover scaling
                cb.group.scale.setScalar(transT);
                cb.core.material.opacity = transT;
                cb.wire.material.opacity = (0.44 + 0.52 * cb.hoverWeight) * transT;
                if (cb.accessory) {
                    cb.accessory.material.opacity = cb.accBaseOpacity * transT;
                }

                // Holographic target reticle: billboard to camera, gentle rotation & fade
                if (cb.reticle) {
                    cb.reticle.quaternion.copy(camera.quaternion);
                    cb.reticle.rotateZ(clockTime * 1.6);
                    cb.reticle.material.opacity = cb.hoverWeight * 0.88 * transT;
                }

                cb.core.rotation.y = clockTime * (0.7 + 0.6 * cb.hoverWeight);
                cb.wire.rotation.x = clockTime * (0.5 + 0.4 * cb.hoverWeight);
                cb.wire.rotation.y = -clockTime * (0.35 + 0.3 * cb.hoverWeight);
                if (cb.accessory) {
                    cb.accessory.rotation.z = clockTime * (0.25 + 0.25 * cb.hoverWeight);
                }
            }
        }

        // Progress damping
        const progressDamping = 1 - Math.exp(-delta * 6);
        currentProgress += (targetProgress - currentProgress) * progressDamping;
        if (Math.abs(currentProgress - targetProgress) < 0.0008) {
            currentProgress = targetProgress;
        }

        // Pointer damping
        const pointerDamping = 1 - Math.exp(-delta * 5);
        currentPointerX += (targetPointerX - currentPointerX) * pointerDamping;
        currentPointerY += (targetPointerY - currentPointerY) * pointerDamping;

        // Velocity damping for warp streaks
        const velocityDamping = 1 - Math.exp(-delta * 7);
        currentVelocity += (targetVelocity - currentVelocity) * velocityDamping;
        targetVelocity *= Math.exp(-delta * 4);

        // Spherical orbit coordinates damping
        const orbitDamping = 1 - Math.exp(-delta * 6.5);
        currentOrbitRadius += (targetOrbitRadius - currentOrbitRadius) * orbitDamping;
        currentOrbitTheta += (targetOrbitTheta - currentOrbitTheta) * orbitDamping;
        currentOrbitPhi += (targetOrbitPhi - currentOrbitPhi) * orbitDamping;

        // Interpolate normal flight waypoint
        const flight = interpolateFlight(currentProgress);

        // Camera and Singularity targets calculation
        const normalCamX = flight.camX + currentPointerX * 0.45;
        const normalCamY = flight.camY + currentPointerY * 0.3;
        const normalCamZ = flight.camZ;

        let cosmosTargetCamX, cosmosTargetCamY, cosmosTargetCamZ;
        if (selectedOrb) {
            selectedOrb.group.getWorldPosition(tempOrbPos);
            targetLookAt.set(tempOrbPos.x, tempOrbPos.y, tempOrbPos.z);

            const outward = tempOrbPos.clone().normalize();
            cosmosTargetCamX = tempOrbPos.x + outward.x * 4.4;
            cosmosTargetCamY = tempOrbPos.y + 1.2;
            cosmosTargetCamZ = tempOrbPos.z + outward.z * 4.4 + 2.8;
        } else {
            targetLookAt.set(0, 0, 0);
            cosmosTargetCamX = currentOrbitRadius * Math.sin(currentOrbitPhi) * Math.sin(currentOrbitTheta);
            cosmosTargetCamY = currentOrbitRadius * Math.cos(currentOrbitPhi);
            cosmosTargetCamZ = currentOrbitRadius * Math.sin(currentOrbitPhi) * Math.cos(currentOrbitTheta);
        }

        // Blend targets between modes
        const targetCamX = (1 - cosmosTransition) * normalCamX + cosmosTransition * cosmosTargetCamX;
        const targetCamY = (1 - cosmosTransition) * normalCamY + cosmosTransition * cosmosTargetCamY;
        const targetCamZ = (1 - cosmosTransition) * normalCamZ + cosmosTransition * cosmosTargetCamZ;

        const targetSingX = (1 - cosmosTransition) * flight.singX;
        const targetSingY = (1 - cosmosTransition) * flight.singY;
        const targetSingZ = (1 - cosmosTransition) * flight.singZ;

        // Camera Physical Momentum Damping
        const camDamping = 1 - Math.exp(-delta * 6.5);
        currentCamX += (targetCamX - currentCamX) * camDamping;
        currentCamY += (targetCamY - currentCamY) * camDamping;
        currentCamZ += (targetCamZ - currentCamZ) * camDamping;

        currentSingX += (targetSingX - currentSingX) * camDamping;
        currentSingY += (targetSingY - currentSingY) * camDamping;
        currentSingZ += (targetSingZ - currentSingZ) * camDamping;

        currentLookAt.lerp(targetLookAt, camDamping);

        // Origin return check when user scrolls back to top in normal mode
        if (targetProgress === 0 && currentProgress === 0 && cosmosTransition < 0.002) {
            if (Math.abs(currentCamZ - 16) < 0.04) {
                currentCamX = 0; currentCamY = 0; currentCamZ = 16;
                currentRotX = 0; currentRotY = 0; currentRotZ = 0;
                currentSingX = 3.6; currentSingY = 0.2; currentSingZ = 0;
            }
        }

        camera.position.set(currentCamX, currentCamY, currentCamZ);

        // Rotation: Seamless transition between waypoint flight euler and orbit lookAt
        const normalRotX = flight.rotX + currentPointerY * 0.04;
        const normalRotY = flight.rotY + currentPointerX * 0.06;
        const normalRotZ = flight.rotZ + Math.sin(clockTime * 0.15) * 0.015;

        currentRotX += (normalRotX - currentRotX) * camDamping;
        currentRotY += (normalRotY - currentRotY) * camDamping;
        currentRotZ += (normalRotZ - currentRotZ) * camDamping;

        if (cosmosTransition < 0.005) {
            camera.rotation.set(currentRotX, currentRotY, currentRotZ);
        } else if (cosmosTransition > 0.995) {
            camera.lookAt(currentLookAt);
        } else {
            normalEuler.set(currentRotX, currentRotY, currentRotZ, 'YXZ');
            normalQuat.setFromEuler(normalEuler);
            tempCamPos.set(currentCamX, currentCamY, currentCamZ);
            lookAtMatrix.lookAt(tempCamPos, currentLookAt, upVector);
            cosmosQuat.setFromRotationMatrix(lookAtMatrix);
            camera.quaternion.slerpQuaternions(normalQuat, cosmosQuat, cosmosTransition);
        }

        // Singularity position and spin
        singularity.position.set(currentSingX, currentSingY, currentSingZ);
        photonRing.rotation.z = clockTime * 0.4;
        ringMeshes[0].rotation.z = clockTime * 0.08;
        ringMeshes[1].rotation.z = -clockTime * 0.06;
        ringMeshes[2].rotation.z = clockTime * 0.04;
        lensRing.rotation.z = clockTime * 0.03;

        // Pulsar expansion
        const pulse = 1 + Math.sin(clockTime * 1.8) * 0.06;
        pulsarRing.scale.set(pulse, pulse, pulse);

        // Relativistic warp streak expansion on starfield
        const warpFactor = Math.max(0.06, currentVelocity * 1.8);
        if (Math.abs(warpFactor - lastWarp) > 0.005 || currentVelocity > 0.02) {
            lastWarp = warpFactor;
            for (let i = 0; i < starCount; i++) {
                const data = starData[i];
                starTransform.position.set(data.x, data.y, data.z);
                starTransform.scale.set(data.baseScale, data.baseScale, warpFactor * data.baseScale);
                starTransform.updateMatrix();
                starField.setMatrixAt(i, starTransform.matrix);
            }
            starField.instanceMatrix.needsUpdate = true;
        }

        render();
    }

    function schedule() {
        const next = visible && !document.hidden && !reduced();
        if (next !== playing) {
            playing = next;
            lastFrame = performance.now();
            renderer.setAnimationLoop(next ? frame : null);
        }
        if (!next) {
            camera.position.set(0, 0, 16);
            camera.rotation.set(0, 0, 0);
            render();
        }
    }

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render();
    }

    function theme() {
        const light = document.documentElement.dataset.theme === 'light';
        const primaryColor = light ? 0x7052b5 : 0xa79bea;
        const dimColor = light ? 0x937fc4 : 0x7660c7;

        coreMaterial.color.setHex(light ? 0xf0ecf8 : 0x090710);
        photonMaterial.color.setHex(primaryColor);
        ringMaterial.color.setHex(primaryColor);
        lensMaterial.color.setHex(dimColor);
        pulsarMaterial.color.setHex(primaryColor);
        starMaterial.color.setHex(primaryColor);
        orbitTrackMat.color.setHex(primaryColor);

        ringMaterial.opacity = light ? 0.22 : 0.35;
        starMaterial.opacity = light ? 0.48 : 0.72;
        orbitTrackMat.opacity = light ? 0.24 : 0.16;
        render();
    }

    // 3D Raycasting & Orbit Controls
    const raycaster = new THREE.Raycaster();
    const pointerVec = new THREE.Vector2();
    let isPointerDown = false;
    let pointerStartX = 0, pointerStartY = 0;
    let dragDistance = 0;

    function selectProject(proj) {
        const card = document.getElementById('cosmos-card');
        const chips = document.querySelectorAll('.cosmos-chip');

        if (!proj) {
            selectedOrb = null;
            if (card) card.hidden = true;
            chips.forEach(c => c.classList.remove('active'));
            return;
        }

        const found = celestialBodies.find(b => b.data.id === proj.id);
        if (!found) return;
        selectedOrb = found;

        chips.forEach(c => {
            const isActive = c.dataset.id === proj.id;
            c.classList.toggle('active', isActive);
            if (isActive) c.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });

        if (card) {
            const img = document.getElementById('cosmos-card-img');
            const tag = document.getElementById('cosmos-card-tag');
            const badge = document.getElementById('cosmos-card-badge');
            const title = document.getElementById('cosmos-card-title');
            const desc = document.getElementById('cosmos-card-desc');
            const link = document.getElementById('cosmos-card-link');

            if (img) {
                img.src = proj.image;
                img.alt = `${proj.name} visual`;
            }
            if (tag) tag.textContent = proj.tag;
            if (badge) {
                if (proj.badge) {
                    badge.textContent = proj.badge;
                    badge.hidden = false;
                } else {
                    badge.hidden = true;
                }
            }
            if (title) title.textContent = proj.name;
            if (desc) {
                desc.innerHTML = `<span class="content-en">${proj.descEn}</span><span class="content-vi">${proj.descVi}</span>`;
            }
            if (link) {
                link.href = proj.link;
                if (/^https?:/.test(proj.link)) {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                } else {
                    link.removeAttribute('target');
                    link.removeAttribute('rel');
                }
            }
            card.hidden = false;
        }
    }

    function buildHudChips() {
        const container = document.getElementById('cosmos-hud-chips');
        if (!container || container.dataset.built === '1') return;
        container.dataset.built = '1';

        container.innerHTML = CELESTIAL_PROJECTS.map(proj => {
            const hex = '#' + proj.color.toString(16).padStart(6, '0');
            return `<button type="button" class="cosmos-chip" data-id="${proj.id}"><span class="cosmos-chip-orb" style="background-color: ${hex}; color: ${hex};"></span><span>${proj.name}</span></button>`;
        }).join('');

        container.querySelectorAll('.cosmos-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const proj = CELESTIAL_PROJECTS.find(p => p.id === id);
                if (proj) {
                    if (selectedOrb && selectedOrb.data.id === id) {
                        selectProject(null);
                    } else {
                        selectProject(proj);
                    }
                }
            });
        });
    }

    function toggleCosmosMode(active) {
        cosmosMode = typeof active === 'boolean' ? active : !cosmosMode;
        targetCosmosTransition = cosmosMode ? 1 : 0;
        if (reduced()) {
            cosmosTransition = targetCosmosTransition;
        }

        const overlay = document.getElementById('cosmos-overlay');
        const toggleBtn = document.getElementById('cosmos-toggle');

        if (cosmosMode) {
            document.body.classList.add('cosmos-active');
            if (overlay) {
                overlay.hidden = false;
                overlay.setAttribute('aria-hidden', 'false');
            }
            if (toggleBtn) {
                toggleBtn.classList.add('active');
                toggleBtn.setAttribute('aria-pressed', 'true');
                toggleBtn.setAttribute('aria-label', 'Return to classic view');
                toggleBtn.title = 'Classic / Cổ điển';
                toggleBtn.innerHTML = '<span aria-hidden="true">📄</span> <span class="cosmos-btn-text"><span class="content-en">Classic</span><span class="content-vi">Cổ điển</span></span>';
            }
            buildHudChips();
            targetOrbitTheta = 0.35;
            targetOrbitPhi = 1.15;
            targetOrbitRadius = 26;
            selectProject(null);
            document.dispatchEvent(new CustomEvent('cosmoschange', { detail: { active: true } }));
        } else {
            document.body.classList.remove('cosmos-active');
            if (overlay) {
                overlay.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    if (!cosmosMode) overlay.hidden = true;
                }, 350);
            }
            if (toggleBtn) {
                toggleBtn.classList.remove('active');
                toggleBtn.setAttribute('aria-pressed', 'false');
                toggleBtn.setAttribute('aria-label', '3D Cosmos Mode');
                toggleBtn.title = 'Cosmos / Vũ trụ';
                toggleBtn.innerHTML = '<span aria-hidden="true">🪐</span> <span class="cosmos-btn-text"><span class="content-en">Cosmos</span><span class="content-vi">Vũ trụ</span></span>';
            }
            selectProject(null);
            currentRotX = camera.rotation.x;
            currentRotY = camera.rotation.y;
            currentRotZ = camera.rotation.z;
            document.dispatchEvent(new CustomEvent('cosmoschange', { detail: { active: false } }));
        }
    }

    // Pointer events on canvas
    canvas.addEventListener('pointerdown', event => {
        if (!cosmosMode) return;
        isPointerDown = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        dragDistance = 0;
        try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
    }, options);

    window.addEventListener('pointermove', event => {
        if (reduced()) return;

        if (!cosmosMode) {
            targetPointerX = (event.clientX / window.innerWidth) * 2 - 1;
            targetPointerY = -(event.clientY / window.innerHeight) * 2 + 1;
            return;
        }

        // Cosmos mode pointer handling
        targetPointerX = 0;
        targetPointerY = 0;

        if (isPointerDown) {
            const dx = event.clientX - pointerStartX;
            const dy = event.clientY - pointerStartY;
            dragDistance += Math.hypot(dx, dy);
            pointerStartX = event.clientX;
            pointerStartY = event.clientY;

            targetOrbitTheta -= dx * 0.005;
            targetOrbitPhi = Math.max(0.2, Math.min(1.48, targetOrbitPhi - dy * 0.005));
        } else if (cosmosTransition > 0.72) {
            // Hover detection via raycaster
            pointerVec.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointerVec.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointerVec, camera);
            const hits = raycaster.intersectObjects(hitMeshes, false);

            if (hits.length > 0) {
                const foundUserData = hits[0].object.userData;
                if (foundUserData !== hoveredBody) {
                    hoveredBody = foundUserData;
                    canvas.style.cursor = 'pointer';
                }
            } else {
                if (hoveredBody) {
                    hoveredBody = null;
                }
                canvas.style.cursor = isPointerDown ? 'grabbing' : 'grab';
            }
        } else {
            if (hoveredBody) {
                hoveredBody = null;
            }
            canvas.style.cursor = isPointerDown ? 'grabbing' : 'grab';
        }
    }, options);

    canvas.addEventListener('pointerup', event => {
        if (!cosmosMode) return;
        isPointerDown = false;
        try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
        canvas.style.cursor = hoveredBody ? 'pointer' : 'grab';

        if (dragDistance < 6 && cosmosTransition > 0.72) {
            if (hoveredBody) {
                selectProject(hoveredBody.project);
            } else if (selectedOrb) {
                selectProject(null);
            }
        }
    }, options);

    canvas.addEventListener('wheel', event => {
        if (!cosmosMode) return;
        event.preventDefault();
        targetOrbitRadius = Math.max(9, Math.min(38, targetOrbitRadius + event.deltaY * 0.025));
    }, { passive: false, signal: signal.signal });

    window.addEventListener('pointerleave', () => {
        targetPointerX = 0;
        targetPointerY = 0;
        hoveredBody = null;
    }, options);

    // DOM UI bindings
    const cosmosToggle = document.getElementById('cosmos-toggle');
    if (cosmosToggle) {
        cosmosToggle.addEventListener('click', () => toggleCosmosMode());
    }

    const cosmosCardClose = document.getElementById('cosmos-card-close');
    if (cosmosCardClose) {
        cosmosCardClose.addEventListener('click', () => selectProject(null));
    }

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && cosmosMode) {
            if (selectedOrb) {
                selectProject(null);
            } else {
                toggleCosmosMode(false);
            }
        }
    }, options);

    window.toggleCosmosMode = toggleCosmosMode;

    window.addEventListener('resize', resize, options);
    document.addEventListener('themechange', theme, options);
    document.addEventListener('motionchange', schedule, options);
    document.addEventListener('visibilitychange', schedule, options);
    window.addEventListener('pageshow', schedule, options);

    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        renderer.setAnimationLoop(null);
        canvas.hidden = true;
    }, options);

    window.addEventListener('pagehide', event => {
        if (event.persisted) {
            renderer.setAnimationLoop(null);
            playing = false;
            return;
        }
        signal.abort();
        renderer.setAnimationLoop(null);
        disposables.forEach(d => {
            if (d && typeof d.dispose === 'function') d.dispose();
        });
        renderer.dispose();
        renderer.forceContextLoss();
    }, options);

    theme();
    resize();
    schedule();
}

if (canvas) {
    try {
        createField();
    } catch (_) {
        canvas.hidden = true;
    }
}
