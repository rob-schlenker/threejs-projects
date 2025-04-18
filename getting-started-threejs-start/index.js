import * as THREE from 'three'
import getLayer from './getLayer.js'
import { OrbitControls } from 'jsm/controls/OrbitControls.js'
import getStarfield from './assets/getStarfield.js'
import { getFresnelMat } from './assets/getFresnelMat.js'
import { GLTFExporter } from './assets/GLTFExporter.js'

// const btn = document.querySelector('button')

// Add event listener to the button
// btn.addEventListener('click', () => {
//   const exporter = new GLTFExporter()
//   exporter.parse(
//     scene,
//     (result) => {
//       if (result instanceof ArrayBuffer) {
//         downloadGLB(result)
//       } else {
//         console.error('GLTFExporter did not return a binary result.')
//       }
//     },
//     { binary: true }, // Export as binary GLB
//   )
// })

// Function to download the GLB file
function downloadGLB(data) {
  const blob = new Blob([data], { type: 'model/gltf-binary' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'scene.glb'
  link.click()
}

const w = window.innerWidth
const h = window.innerHeight
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000)
camera.position.z = 5
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(w, h)
document.body.appendChild(renderer.domElement)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputColorSpace = THREE.LinearSRGBColorSpace

const earthGroup = new THREE.Group()
earthGroup.rotation.z = (-23.4 * Math.PI) / 180
scene.add(earthGroup)

const ctrls = new OrbitControls(camera, renderer.domElement)
ctrls.enableDamping = true
const detail = 12
const loader = new THREE.TextureLoader()
const geometry = new THREE.IcosahedronGeometry(1, detail)
const material = new THREE.MeshPhongMaterial({
  map: loader.load('./assets/earthmap1k.jpg'),
  // specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load('./textures/01_earthbump1k.jpg'),
  bumpScale: 0.04,
})
const earthMesh = new THREE.Mesh(geometry, material)
earthGroup.add(earthMesh)

const lightsMat = new THREE.MeshBasicMaterial({
  // color: 0x00ff00,
  map: loader.load('./textures/03_earthlights1k.jpg'),
  // transparent: true,
  // opacity: 1.8,
  blending: THREE.AdditiveBlending,
})
const lightsMesh = new THREE.Mesh(geometry, lightsMat)
earthGroup.add(lightsMesh)

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load('./textures/04_earthcloudmap.jpg'),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
})
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat)
cloudsMesh.scale.setScalar(1.003)
earthGroup.add(cloudsMesh)

const fresnelMat = getFresnelMat()
const glowMesh = new THREE.Mesh(geometry, fresnelMat)
glowMesh.scale.setScalar(1.01)
earthGroup.add(glowMesh)

const stars = getStarfield({ numStars: 20000 })
scene.add(stars)

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0)
sunLight.position.set(-2, 0.5, 1.5)
scene.add(sunLight)

// const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
// scene.add(hemiLight)

// Sprites BG
// const gradientBackground = getLayer({
//   hue: 0.5,
//   numSprites: 8,
//   opacity: 0.2,
//   radius: 10,
//   size: 24,
//   z: -15.5,
// })
// scene.add(gradientBackground)

function animate() {
  requestAnimationFrame(animate)
  earthMesh.rotation.y += 0.002
  lightsMesh.rotation.y += 0.002
  cloudsMesh.rotation.y += 0.0023
  glowMesh.rotation.y += 0.002
  stars.rotation.y -= 0.0002
  renderer.render(scene, camera)
  ctrls.update()
}

animate()

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', handleWindowResize, false)
