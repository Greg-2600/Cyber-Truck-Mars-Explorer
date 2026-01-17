// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Mars atmosphere
scene.background = new THREE.Color(0x884422);
scene.fog = new THREE.Fog(0x884422, 1200, 3000);

// Create Mars sky dome
function createMarsSky() {
    const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Mars gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff9966');
    gradient.addColorStop(0.4, '#cc7744');
    gradient.addColorStop(0.6, '#aa5533');
    gradient.addColorStop(1, '#663322');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add dust particles effect
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3;
        ctx.fillStyle = `rgba(255, 200, 150, ${Math.random() * 0.4})`;
        ctx.fillRect(x, y, size, size);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    skyMaterial.map = texture;
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

createMarsSky();

// Lighting - Mars dust and sunset colors
const sunLight = new THREE.DirectionalLight(0xffaa66, 2.0);
sunLight.position.set(400, 500, 300);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.far = 3000;
sunLight.shadow.camera.left = -1000;
sunLight.shadow.camera.right = 1000;
sunLight.shadow.camera.top = 1000;
sunLight.shadow.camera.bottom = -1000;
scene.add(sunLight);

// Multiple light sources for dramatic Mars lighting
const ambientLight = new THREE.AmbientLight(0xffaa88, 0.9);
scene.add(ambientLight);

// Add fill light for Martian atmosphere
const fillLight = new THREE.DirectionalLight(0xffbb99, 0.6);
fillLight.position.set(-300, 300, -300);
scene.add(fillLight);

// Player/Camera controller
const player = {
    position: new THREE.Vector3(0, 5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0,
    maxSpeed: 3.5,
    sprintSpeed: 5.5,
    acceleration: 0.025,
    friction: 0.88,
    jumpPower: 0.5,
    isOnGround: false,
    isJumping: false,
    rotation: { x: 0, y: 0 }
};

camera.position.copy(player.position);

// Input handling
const keys = {};
const mouseMovement = { x: 0, y: 0 };
let isPointerLocked = false;

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.addEventListener('click', () => {
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
    document.body.requestPointerLock();
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body) {
        player.rotation.y -= e.movementX * 0.005;
        player.rotation.x -= e.movementY * 0.005;
        player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotation.x));
    }
});

// Terrain generation with EXTREME Mars features
function createTerrain() {
    const geometry = new THREE.PlaneGeometry(3000, 3000, 300, 300);
    
    // Rotate plane to be horizontal (XZ plane)
    geometry.rotateX(-Math.PI / 2);
    
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    // Generate EXTREME height variation
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        
        let height = 0;
        
        // MASSIVE amplitude noise
        height += Math.sin(x * 0.003) * Math.cos(z * 0.003) * 80;
        height += Math.sin(x * 0.008) * Math.cos(z * 0.008) * 40;
        height += Math.sin(x * 0.015) * Math.cos(z * 0.015) * 20;
        height += Math.sin(x * 0.03) * Math.cos(z * 0.03) * 10;
        height += (Math.random() - 0.5) * 15;
        
        // HUGE craters
        const c1 = Math.sqrt((x - 200) ** 2 + (z - 150) ** 2);
        if (c1 < 150) height -= (150 - c1) * 1.2;
        
        const c2 = Math.sqrt((x + 250) ** 2 + (z - 250) ** 2);
        if (c2 < 180) height -= (180 - c2) * 1.3;
        
        const c3 = Math.sqrt((x - 300) ** 2 + (z + 200) ** 2);
        if (c3 < 160) height -= (160 - c3) * 1.1;
        
        const c4 = Math.sqrt((x + 100) ** 2 + (z + 300) ** 2);
        if (c4 < 170) height -= (170 - c4) * 1.2;
        
        positions[i + 1] = height;
    }
    
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Create VIVID Mars texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // DARK rusty base
    ctx.fillStyle = '#6B3410';
    ctx.fillRect(0, 0, 2048, 2048);
    
    // Add large color patches with HIGH contrast
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        const radius = Math.random() * 300 + 100;
        const hue = Math.floor(Math.random() * 30); // Red/orange range
        const sat = Math.floor(Math.random() * 30 + 50);
        const light = Math.floor(Math.random() * 30 + 35);
        
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add LARGE craters with strong shadows
    ctx.fillStyle = '#3D1F0A';
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        const radius = Math.random() * 200 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Crater rims - bright
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 8;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        const radius = Math.random() * 200 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Sand dunes - directional patterns
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#C9956B';
    ctx.lineWidth = 3;
    for (let i = 0; i < 200; i++) {
        const startX = Math.random() * 2048;
        const startY = Math.random() * 2048;
        const length = Math.random() * 400 + 200;
        const angle = Math.random() * 0.3 + 0.1; // Directional
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xaa5533,
        roughness: 0.94,
        metalness: 0.0
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    return terrain;
}

// Create Cyber Truck (simplified geometric shape)
function createCyberTruck() {
    const truck = new THREE.Group();
    
    // Main cabin (angular cybertruck shape)
    const cabinGeometry = new THREE.BoxGeometry(2, 2, 4);
    const cabinMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.9,
        roughness: 0.2
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.y = 1.5;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    truck.add(cabin);
    
    // Windows (cyan tint for cyberpunk feel)
    const windowGeometry = new THREE.BoxGeometry(1.8, 0.8, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.3,
        roughness: 0.1,
        emissive: 0x0088ff,
        emissiveIntensity: 0.3
    });
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(0, 1.5, 2.2);
    truck.add(frontWindow);
    
    // Cargo bed
    const bedGeometry = new THREE.BoxGeometry(2.2, 1.5, 2.5);
    const bedMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f0f1e,
        metalness: 0.8,
        roughness: 0.3
    });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.set(0, 1.2, -1.5);
    bed.castShadow = true;
    bed.receiveShadow = true;
    truck.add(bed);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.6,
        roughness: 0.8
    });
    
    const wheelPositions = [
        [-1.2, 0.6, 1],
        [1.2, 0.6, 1],
        [-1.2, 0.6, -2],
        [1.2, 0.6, -2]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        truck.add(wheel);
    });
    
    truck.position.copy(player.position);
    truck.scale.set(1.5, 1.5, 1.5);
    
    return truck;
}

// Create scattered Mars objects
function createMarsStructures() {
    const structures = new THREE.Group();
    
    // Create MANY more structures scattered around Mars
    const positions = [
        // Domes
        { pos: [100, 0, 100], type: 'dome' },
        { pos: [-150, 0, 200], type: 'dome' },
        { pos: [-200, 0, -200], type: 'dome' },
        { pos: [150, 0, 300], type: 'dome' },
        { pos: [300, 0, 300], type: 'dome' },
        { pos: [-350, 0, 100], type: 'dome' },
        { pos: [250, 0, -250], type: 'dome' },
        { pos: [-100, 0, -400], type: 'dome' },
        { pos: [400, 0, -100], type: 'dome' },
        { pos: [-300, 0, 300], type: 'dome' },
        
        // Towers
        { pos: [200, 0, -150], type: 'tower' },
        { pos: [300, 0, 50], type: 'tower' },
        { pos: [-250, 0, -150], type: 'tower' },
        { pos: [50, 0, -100], type: 'tower' },
        { pos: [-400, 0, 0], type: 'tower' },
        { pos: [150, 0, -300], type: 'tower' },
        { pos: [-100, 0, 350], type: 'tower' },
        { pos: [350, 0, 200], type: 'tower' },
        { pos: [-50, 0, 250], type: 'tower' },
        { pos: [400, 0, 400], type: 'tower' },
        
        // Rock formations
        { pos: [200, 0, -150], type: 'rocks' },
        { pos: [-100, 0, -300], type: 'rocks' },
        { pos: [0, 0, 200], type: 'rocks' },
        { pos: [-300, 0, -300], type: 'rocks' },
        { pos: [350, 0, -200], type: 'rocks' },
        { pos: [-200, 0, 100], type: 'rocks' },
        { pos: [100, 0, -200], type: 'rocks' },
        { pos: [250, 0, 100], type: 'rocks' },
        { pos: [-150, 0, -100], type: 'rocks' },
        { pos: [0, 0, -350], type: 'rocks' },
        
        // Solar panels
        { pos: [180, 0, 250], type: 'solar' },
        { pos: [-280, 0, 50], type: 'solar' },
        { pos: [280, 0, -100], type: 'solar' },
        { pos: [-100, 0, 100], type: 'solar' },
        { pos: [320, 0, -300], type: 'solar' },
        
        // Drill equipment
        { pos: [150, 0, -50], type: 'drill' },
        { pos: [-200, 0, -50], type: 'drill' },
        { pos: [50, 0, 300], type: 'drill' },
        { pos: [-350, 0, 200], type: 'drill' },
        
        // Bridges
        { pos: [100, 0, 400], type: 'bridge' },
        { pos: [-150, 0, -200], type: 'bridge' },
        { pos: [400, 0, 100], type: 'bridge' }
    ];
    
    positions.forEach(item => {
        if (item.type === 'dome') {
            createDome(item.pos[0], item.pos[1], item.pos[2], structures);
        } else if (item.type === 'tower') {
            createTower(item.pos[0], item.pos[1], item.pos[2], structures);
        } else if (item.type === 'rocks') {
            createRockFormation(item.pos[0], item.pos[1], item.pos[2], structures);
        } else if (item.type === 'solar') {
            createSolarPanel(item.pos[0], item.pos[1], item.pos[2], structures);
        } else if (item.type === 'drill') {
            createDrill(item.pos[0], item.pos[1], item.pos[2], structures);
        } else if (item.type === 'bridge') {
            createBridge(item.pos[0], item.pos[1], item.pos[2], structures);
        }
    });
    
    scene.add(structures);
}

function createDome(x, y, z, parent) {
    const geometry = new THREE.IcosahedronGeometry(15, 3);
    const material = new THREE.MeshStandardMaterial({
        color: 0x2a2a4a,
        metalness: 0.4,
        roughness: 0.6,
        emissive: 0x0055aa,
        emissiveIntensity: 0.2
    });
    const dome = new THREE.Mesh(geometry, material);
    dome.position.set(x, y + 15, z);
    dome.castShadow = true;
    dome.receiveShadow = true;
    parent.add(dome);
    
    // Dome entrance
    const doorGeometry = new THREE.BoxGeometry(8, 10, 1);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x001a33,
        emissive: 0x0066ff,
        emissiveIntensity: 0.5
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(x, y + 5, z + 14);
    parent.add(door);
}

function createTower(x, y, z, parent) {
    const geometry = new THREE.CylinderGeometry(4, 5, 40, 8);
    const material = new THREE.MeshStandardMaterial({
        color: 0x3a3a2a,
        metalness: 0.5,
        roughness: 0.7
    });
    const tower = new THREE.Mesh(geometry, material);
    tower.position.set(x, y + 20, z);
    tower.castShadow = true;
    tower.receiveShadow = true;
    parent.add(tower);
    
    // Tower top
    const topGeometry = new THREE.ConeGeometry(4, 8, 8);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff3300,
        emissiveIntensity: 0.3,
        metalness: 0.8
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(x, y + 44, z);
    top.castShadow = true;
    parent.add(top);
}

function createRockFormation(x, y, z, parent) {
    for (let i = 0; i < 5; i++) {
        const size = 5 + Math.random() * 8;
        const geometry = new THREE.IcosahedronGeometry(size, 1);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.05, 0.3, 0.4),
            roughness: 0.9,
            metalness: 0.1
        });
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(
            x + (Math.random() - 0.5) * 30,
            y + size,
            z + (Math.random() - 0.5) * 30
        );
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        parent.add(rock);
    }
}

function createSolarPanel(x, y, z, parent) {
    const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 15, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.7,
        roughness: 0.3
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(x, y + 7.5, z);
    pole.castShadow = true;
    pole.receiveShadow = true;
    parent.add(pole);
    
    // Solar panels - array
    for (let i = 0; i < 3; i++) {
        const panelGeometry = new THREE.BoxGeometry(6, 0.3, 8);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x0044aa,
            emissiveIntensity: 0.15
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(x, y + 10 + i * 2, z + 2);
        panel.rotation.z = 0.3;
        panel.castShadow = true;
        panel.receiveShadow = true;
        parent.add(panel);
    }
}

function createDrill(x, y, z, parent) {
    // Drill tower
    const towerGeometry = new THREE.CylinderGeometry(3, 3.5, 30, 6);
    const towerMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a1a,
        metalness: 0.6,
        roughness: 0.5
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(x, y + 15, z);
    tower.castShadow = true;
    tower.receiveShadow = true;
    parent.add(tower);
    
    // Drill head
    const headGeometry = new THREE.ConeGeometry(4, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xaa3333,
        metalness: 0.9,
        roughness: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(x, y + 4, z);
    head.rotation.z = Math.PI;
    head.castShadow = true;
    head.receiveShadow = true;
    parent.add(head);
    
    // Machinery base
    const baseGeometry = new THREE.BoxGeometry(8, 4, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a2a,
        metalness: 0.5,
        roughness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(x, y + 2, z);
    base.castShadow = true;
    base.receiveShadow = true;
    parent.add(base);
}

function createBridge(x, y, z, parent) {
    const bridgeGeometry = new THREE.BoxGeometry(15, 2, 30);
    const bridgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        metalness: 0.7,
        roughness: 0.4
    });
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(x, y + 8, z);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    parent.add(bridge);
    
    // Bridge supports
    for (let i = 0; i < 4; i++) {
        const supportGeometry = new THREE.BoxGeometry(1, 8, 1);
        const supportMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            metalness: 0.8,
            roughness: 0.3
        });
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(x - 6 + i * 4, y + 4, z - 13);
        support.castShadow = true;
        support.receiveShadow = true;
        parent.add(support);
    }
}

// Collision detection (simple ground detection)
function getTerrainHeight(x, z) {
    let height = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxHeight = 0;
    
    for (let oct = 0; oct < 4; oct++) {
        height += amplitude * Math.sin(x * frequency * 0.01) * Math.cos(z * frequency * 0.01);
        maxHeight += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    
    height = (height / maxHeight) * 20 + 3;
    return height;
}

// Update function
function update() {
    // Apply gravity
    player.velocity.y -= 0.02;
    
    // Get current terrain height at player position
    const terrainHeight = getTerrainHeight(player.position.x, player.position.z);
    const playerHeight = 2;
    
    // Ground detection
    if (player.position.y - playerHeight <= terrainHeight) {
        player.position.y = terrainHeight + playerHeight;
        player.velocity.y = 0;
        player.isOnGround = true;
    } else {
        player.isOnGround = false;
    }
    
    // Movement input
    const currentMaxSpeed = keys['shift'] ? player.sprintSpeed : player.maxSpeed;
    const moveVector = new THREE.Vector3();
    
    if (keys['w'] || keys['arrowup']) {
        moveVector.x -= Math.sin(player.rotation.y) * player.acceleration;
        moveVector.z -= Math.cos(player.rotation.y) * player.acceleration;
    }
    if (keys['s'] || keys['arrowdown']) {
        moveVector.x += Math.sin(player.rotation.y) * player.acceleration;
        moveVector.z += Math.cos(player.rotation.y) * player.acceleration;
    }
    if (keys['a'] || keys['arrowleft']) {
        moveVector.x -= Math.sin(player.rotation.y - Math.PI / 2) * player.acceleration;
        moveVector.z -= Math.cos(player.rotation.y - Math.PI / 2) * player.acceleration;
    }
    if (keys['d'] || keys['arrowright']) {
        moveVector.x -= Math.sin(player.rotation.y + Math.PI / 2) * player.acceleration;
        moveVector.z -= Math.cos(player.rotation.y + Math.PI / 2) * player.acceleration;
    }
    
    player.velocity.x += moveVector.x;
    player.velocity.z += moveVector.z;
    
    // Apply friction
    player.velocity.x *= player.friction;
    player.velocity.z *= player.friction;
    
    // Limit speed
    const horizontalSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.z ** 2);
    if (horizontalSpeed > currentMaxSpeed) {
        player.velocity.x = (player.velocity.x / horizontalSpeed) * currentMaxSpeed;
        player.velocity.z = (player.velocity.z / horizontalSpeed) * currentMaxSpeed;
    }
    
    // Jump
    if ((keys[' '] || keys['spacebar']) && player.isOnGround) {
        player.velocity.y = player.jumpPower;
        player.isOnGround = false;
    }
    
    // Apply velocity
    player.position.add(player.velocity);
    
    // Update camera - Position inside truck cabin
    camera.position.copy(player.position);
    camera.position.y += 0.8; // Eye level inside cabin
    camera.position.z += 0.2; // Slightly forward for windshield view
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.rotation.y;
    camera.rotation.x = player.rotation.x;
    
    // Update HUD
    const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.z ** 2) * 100;
    document.getElementById('speed').textContent = `Speed: ${speed.toFixed(1)} km/h`;
    document.getElementById('position').textContent = 
        `Position: (${player.position.x.toFixed(0)}, ${player.position.y.toFixed(0)}, ${player.position.z.toFixed(0)})`;
    
    // Update truck position to follow camera
    cyberTruck.position.copy(player.position);
    cyberTruck.position.y -= 1.5;
    cyberTruck.rotation.y = player.rotation.y;
}

// Create elements
const terrain = createTerrain();
const cyberTruck = createCyberTruck();
createMarsStructures();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate();
