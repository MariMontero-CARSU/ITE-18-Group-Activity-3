import * as THREE from 'three'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const axes = new THREE.AxesHelper(3)
axes.visible = false
const parameters = {
    throwStr: 15,
    captureDuration: 1.5,
    Height: 0.2,
}

//GUI for User to test
gui.add(parameters, 'throwStr', 5, 20).name('Throw Strenght')
gui.add(parameters, 'captureDuration', 0.5, 4).name('Capture Duration')
gui.add(parameters, 'Height', 0.1, 0.5).name('Float Height')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#202030')
scene.add(axes)

//loaders
const gltfLoader =  new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 2, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(5, 10, 7.5)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 2048
dirLight.shadow.mapSize.height = 2048
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far = 50
dirLight.shadow.camera.left = -10
dirLight.shadow.camera.right = 10
dirLight.shadow.camera.top = 10
dirLight.shadow.camera.bottom = -10
scene.add(dirLight)

//Added pointlight for better illumination
const pointlight = new THREE.PointLight(0xffffff, 0.8, 20)
pointlight.position.set(0, 5, 5)
pointlight.castShadow = true
scene.add(pointlight)


/**
 * Physics World
 */
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)


// Contact materials (bouncy)
const defaultMaterial = new CANNON.Material('default')
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    restitution: 0.7,
    friction: 0.3,
})
world.addContactMaterial(contactMaterial)
world.defaultContactMaterial = contactMaterial

//Groundmesh for visibility of texture 
const groundGeometry = new THREE.PlaneGeometry(20, 20)
const groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg')
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping
groundTexture.repeat.set(4, 4)
const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture })
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
groundMesh.rotation.x = -Math.PI / 2
groundMesh.receiveShadow = true
scene.add(groundMesh)

// Ground (invisible)
const groundBody = new CANNON.Body({
    shape: new CANNON.Plane(),
    mass: 0,
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
world.addBody(groundBody)


/**
 * Objects
 */
// Pokemon - Load actual 3D model or use placeholder
let pokemon = new THREE.Group()
let pokemonModel = null

// Add glow effect to Pokemon
const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32)
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6666,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
})
const pokemonGlow = new THREE.Mesh(glowGeometry, glowMaterial)
pokemon.add(pokemonGlow)

// Placeholder while model loads
const pokemonGeo = new THREE.SphereGeometry(1, 32, 32)
const pokemonMat = new THREE.MeshStandardMaterial({ 
    color: 0xff6666,
    metalness: 0.3,
    roughness: 0.4,
    emissive: 0xff3333,
    emissiveIntensity: 0.2
})
const pokemonPlaceholder = new THREE.Mesh(pokemonGeo, pokemonMat)
pokemonPlaceholder.castShadow = true
pokemonPlaceholder.receiveShadow = true
pokemon.add(pokemonPlaceholder)

pokemon.castShadow = true
pokemon.receiveShadow = true
scene.add(pokemon)

/* // Load Pokemon Model (from images)
//This is for test only not the exact object (pokemon)
textureLoader.load(
    '/models/Duck/screenshot/images.jpeg',
    (texture) => {
        console.log('Pokemon image loaded!')

        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide
        })

        const pokemonModel = new THREE.Mesh(geometry, material)
        pokemonModel.scale.set(2, 2, 2)
        pokemonModel.position.set(0, 1, 0)
        pokemonModel.castShadow = true
        pokemonModel.receiveShadow = true

        pokemon.remove(pokemonPlaceholder)
        pokemon.add(pokemonModel)
    },
    (progress) => {
        console.log('Loading pokemon image:', (progress.loaded / progress.total * 100).toFixed(2) + '%')
    },
    (error) => {
        console.error('Error loading pokemon image:', error)
    }
) */


// Pokemon Physics Body Placeholder
const pokemonBody = new CANNON.Body({
    mass: 0, // static
    shape: new CANNON.Sphere(1),
    position: new CANNON.Vec3(0, 1, 0),
})
world.addBody(pokemonBody)

// Pokeball - Enhanced with proper colors and details
const pokeballGroup = new THREE.Group()

// Top half (red)
const topHalfGeo = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
const topHalfMat = new THREE.MeshStandardMaterial({ 
    color: 0xee1515,
    metalness: 0.4,
    roughness: 0.3
})
const topHalf = new THREE.Mesh(topHalfGeo, topHalfMat)
topHalf.castShadow = true
pokeballGroup.add(topHalf)

// Bottom half (white)
const bottomHalfGeo = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)
const bottomHalfMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    metalness: 0.4,
    roughness: 0.3
})
const bottomHalf = new THREE.Mesh(bottomHalfGeo, bottomHalfMat)
bottomHalf.castShadow = true
pokeballGroup.add(bottomHalf)

// Middle black band
const bandGeo = new THREE.TorusGeometry(0.5, 0.08, 16, 32)
const bandMat = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    metalness: 0.6,
    roughness: 0.2
})
const band = new THREE.Mesh(bandGeo, bandMat)
band.rotation.x = Math.PI / 2
band.castShadow = true
pokeballGroup.add(band)

// Center button
const buttonGeo = new THREE.SphereGeometry(0.15, 32, 32)
const buttonMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x4444ff,
    emissiveIntensity: 0.3
})
const button = new THREE.Mesh(buttonGeo, buttonMat)
button.castShadow = true
pokeballGroup.add(button)

// Inner button detail
const innerButtonGeo = new THREE.SphereGeometry(0.1, 32, 32)
const innerButtonMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.9,
    roughness: 0.1
})
const innerButton = new THREE.Mesh(innerButtonGeo, innerButtonMat)
innerButton.castShadow = true
pokeballGroup.add(innerButton)

const pokeball = pokeballGroup
pokeball.castShadow = true
scene.add(pokeball)

// Pokeball Physics Body Placeholder
const pokeballBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(0.5),
    position: new CANNON.Vec3(0, -2, 0),
    material: defaultMaterial,
    collisionResponse: true
})
world.addBody(pokeballBody)
hidePokeball()

function hidePokeball() {
    pokeball.visible = false
    pokeballBody.type = CANNON.Body.KINEMATIC // disable physics
    pokeballBody.velocity.setZero()
    pokeballBody.angularVelocity.setZero()
    pokeballBody.position.set(0, -10, 0) // move far below scene
    pokeballBody.updateMassProperties()
}



/**
 * Game Logic
 */
// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// State Machine
let state = 'idle' // 'idle', 'capturing', 'captured', 'released'

// Event Listener
window.addEventListener('click', (event) => {
    // Normalize mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects([pokemon, pokeball], true)

    if (intersects.length > 0) {
        const hit = intersects[0].object
        if ((hit === pokemon || pokemon.children.includes(hit)) && state === 'idle') {
            throwPokeball()
        } else if ((pokeball.children.includes(hit) || hit === pokeball) && state === 'captured') {
            releasePokemon()
        }
    }
})

// Physics move
function moveBodyTo(body, target, duration = 1, onComplete = () => {}) {
    const start = body.position.clone()
    let elapsed = 0

    const animate = () => {
        const delta = clock.getDelta()
        elapsed += delta
        const t = Math.min(elapsed / duration, 1)

        body.position.x = THREE.MathUtils.lerp(start.x, target.x, t)
        body.position.y = THREE.MathUtils.lerp(start.y, target.y, t)
        body.position.z = THREE.MathUtils.lerp(start.z, target.z, t)

        if (t < 1) {
            requestAnimationFrame(animate)
        } else {
            onComplete()
        }
    }

    requestAnimationFrame(animate)
}

// Throw Pokeball
// TODO: Fix pokeball throw trajectory. Feels a little too stiff but my math ain't mathing anymore
function throwPokeball() {
    if (state !== 'idle') return
    state = 'thrown'

    pokeball.visible = true
    pokeballBody.type = CANNON.Body.DYNAMIC
    pokeballBody.updateMassProperties()

    // Start Position
    pokeballBody.position.set(0, 3, 20)

    // Reset velocities for clean throw
    pokeballBody.velocity.setZero()
    pokeballBody.angularVelocity.setZero()
    
    // Target: Pokemon's current position
    const target = pokemonBody.position.clone()
    const start = pokeballBody.position.clone()

    // Direction toward Pokemon
    const direction = target.vsub(start)
    direction.normalize()

    // Throw strength (adjust via GUI)
    const throwStrength = parameters.throwStr

    // Add a bit of upward arc
    direction.y += 0.5  // tweak this to adjust height of the curve

    // Scale velocity by strength
    pokeballBody.velocity.set(
        direction.x * throwStrength,
        direction.y * throwStrength,
        direction.z * throwStrength
    )

    // Add spin for realism
    pokeballBody.angularVelocity.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    )

    console.log('Pokeball thrown!')
}

// Particle effect on capture
function createCaptureEffect() {
    const particleCount = 50
    const particles = new THREE.Group()
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.05, 8, 8)
        const particleMat = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0xff6666 : 0xffff66,
            transparent: true,
            opacity: 1
        })
        const particle = new THREE.Mesh(particleGeo, particleMat)
        
        particle.position.copy(pokemon.position)
        
        const angle = (i / particleCount) * Math.PI * 2
        const radius = Math.random() * 2
        particle.userData.velocity = {
            x: Math.cos(angle) * radius,
            y: Math.random() * 3,
            z: Math.sin(angle) * radius
        }
        
        particles.add(particle)
    }
    
    scene.add(particles)
    
    // Animate particles
    let life = 0
    const animateParticles = () => {
        life += 0.02
        
        particles.children.forEach(particle => {
            particle.position.x += particle.userData.velocity.x * 0.05
            particle.position.y += particle.userData.velocity.y * 0.05
            particle.position.z += particle.userData.velocity.z * 0.05
            particle.userData.velocity.y -= 0.1 // gravity
            particle.material.opacity = 1 - life
        })
        
        if (life < 1) {
            requestAnimationFrame(animateParticles)
        } else {
            scene.remove(particles)
        }
    }
    
    requestAnimationFrame(animateParticles)
}

// Physics Contact Listener
pokeballBody.addEventListener('collide', (e) => {
    if (e.body === pokemonBody && state === 'thrown') {
        console.log('Pokeball hit Pokemon!')
        createCaptureEffect()
        startCaptureAnimation()
    }
})


/**
 * Animations
 */
// Game Animation
function startCaptureAnimation() {
    state = 'capturing'
    pokeballBody.velocity.set(0, 0, 0)
    pokeballBody.angularVelocity.set(0, 0, 0)

    // Disable gravity for smooth float
    pokeballBody.type = CANNON.Body.KINEMATIC
    pokeballBody.updateMassProperties()

    const targetY = 1.5
    const duration = parameters.captureDuration // Use GUI parameter
    let elapsed = 0

    const animate = () => {
        elapsed += clock.getDelta()
        const t = Math.min(elapsed / duration, 1)
        // Move Pokeball upward smoothly
        pokeballBody.position.y = THREE.MathUtils.lerp(pokeballBody.position.y, targetY, 0.05)
        pokemon.scale.setScalar(1 - t)

        if (t < 1) {
            requestAnimationFrame(animate)
        } else {
            pokemon.visible = false
            state = 'captured'
            
            const targetPosition = new CANNON.Vec3(0, 1, 0)
            moveBodyTo(pokeballBody, targetPosition, 0.5, () => {
                state = 'captured'
                console.log('Pokeball at center, floating!')
                floatPokeball()
            })
        }
    }

    requestAnimationFrame(animate)
}

// Floating Pokeball after capture
function floatPokeball() {
  const startY = pokeballBody.position.y
  let t = 0

  const floatLoop = () => {
    if (state !== 'captured') return
    t += 0.02
    pokeballBody.position.y = startY + Math.sin(t) * 0.1
    requestAnimationFrame(floatLoop)
  }

  requestAnimationFrame(floatLoop)
}

function releasePokemon() {
    console.log('Releasing Pokemon...')
    state = 'releasing'
    pokemon.visible = true
    
    // Release particle effect
    const particleCount = 30
    const particles = new THREE.Group()
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.08, 8, 8)
        const particleMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1
        })
        const particle = new THREE.Mesh(particleGeo, particleMat)
        
        particle.position.copy(pokeball.position)
        
        const angle = (i / particleCount) * Math.PI * 2
        particle.userData.velocity = {
            x: Math.cos(angle) * 3,
            y: Math.random() * 2 + 1,
            z: Math.sin(angle) * 3
        }
        
        particles.add(particle)
    }
    
    scene.add(particles)
    
    // Animate release particles
    let life = 0
    const animateReleaseParticles = () => {
        life += 0.03
        
        particles.children.forEach(particle => {
            particle.position.x += particle.userData.velocity.x * 0.05
            particle.position.y += particle.userData.velocity.y * 0.05
            particle.position.z += particle.userData.velocity.z * 0.05
            particle.userData.velocity.y -= 0.08
            particle.material.opacity = 1 - life
            particle.scale.setScalar(1 + life)
        })
        
        if (life < 1) {
            requestAnimationFrame(animateReleaseParticles)
        } else {
            scene.remove(particles)
        }
    }
    
    requestAnimationFrame(animateReleaseParticles)

    const duration = 0.1
    let elapsed = 0

    const animate = () => {
        elapsed += clock.getDelta()
        const t = Math.min(elapsed / duration, 1)
        pokemon.scale.setScalar(t)
        pokeball.scale.setScalar(1 - t)

        if (t < 1) {
            requestAnimationFrame(animate)
        } else {
            pokeball.scale.setScalar(1)
            state = 'idle'
            hidePokeball()
            console.log('Pokemon released!')
        }
    }
    requestAnimationFrame(animate)
}

// Animation Loop
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Step the Physics World
    world.step(1 / 60, elapsedTime, 3)

    // Game Animations
    if (state === 'idle' || state === 'captured') {
        pokemon.rotation.y += 0.01
    }
    
    // Animate Pokemon glow
    if (pokemon.children[0]) {
        pokemon.children[0].material.opacity = 0.3 + Math.sin(elapsedTime * 2) * 0.1
    }
    
    // Animate Pokeball button glow when captured
    if (state === 'captured' && pokeball.children[3]) {
        pokeball.children[3].material.emissiveIntensity = 0.3 + Math.sin(elapsedTime * 3) * 0.2
    }

    // Sync Three.js mesh positions with physics
    pokeball.position.copy(pokeballBody.position)
    pokeball.quaternion.copy(pokeballBody.quaternion)
    pokemon.position.copy(pokemonBody.position)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


tick()