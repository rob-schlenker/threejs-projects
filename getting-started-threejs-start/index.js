import * as THREE from 'three'
import getLayer from './getLayer.js'
import { OrbitControls } from 'jsm/controls/OrbitControls.js'

const w = window.innerWidth
const h = window.innerHeight
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000)
camera.position.z = 5
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(w, h)
document.body.appendChild(renderer.domElement)

const ctrls = new OrbitControls(camera, renderer.domElement)
ctrls.enableDamping = true

const loader = new THREE.TextureLoader()
const geometry = new THREE.IcosahedronGeometry(1, 12)
const material = new THREE.MeshStandardMaterial({
  map: loader.load('./assets/earthmap1k.jpg'),
})
const earthMesh = new THREE.Mesh(geometry, material)
scene.add(earthMesh)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
scene.add(hemiLight)

// Sprites BG
const gradientBackground = getLayer({
  hue: 0.5,
  numSprites: 8,
  opacity: 0.2,
  radius: 10,
  size: 24,
  z: -15.5,
})
scene.add(gradientBackground)

function animate() {
  requestAnimationFrame(animate)
  earthMesh.rotation.x += 0.001
  earthMesh.rotation.y += 0.002
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
