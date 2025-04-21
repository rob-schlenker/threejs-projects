import * as THREE from 'three'
import getLayer from './getLayer.js'
import { OrbitControls } from 'jsm/controls/OrbitControls.js'
import spline from './assets/spline.js'
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

const w = window.innerWidth
const h = window.innerHeight
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x000000, 0.4, 100)

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
camera.position.z = 5
const renderer = new THREE.WebGLRenderer()
renderer.setSize(w, h)
document.body.appendChild(renderer.domElement)

const ctrls = new OrbitControls(camera, renderer.domElement)
ctrls.enableDamping = true

// post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// create a line geometry from the spline
const points = spline.getPoints(100)
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })
const line = new THREE.Line(lineGeometry, lineMaterial)
// scene.add(line)



//create a tube geometry from the spline
const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 18, true)
// const tubeMaterial = new THREE.MeshBasicMaterial({
//   color: 'blue',
//   side: THREE.DoubleSide,
//   wireframe: true,
//   transparent: true, // Optional: transparency
//   opacity: 0.2, // Optional: adjust transparency
// })
// const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
// scene.add(tube)

// create edge geometry from the spline
const edges = new THREE.EdgesGeometry(tubeGeometry, 0.2)
const linesMat = new THREE.LineBasicMaterial({
  color: 'red',
  // linewidth: .02,
})
const tubeLines = new THREE.LineSegments(edges, linesMat)
scene.add(tubeLines)

const boxes = [];

const numBoxes = 55;
const size = 0.075;
const boxGeo = new THREE.BoxGeometry(size, size, size);
for (let i = 0; i < numBoxes; i += 1) {
  const boxMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    // transparent: true,
    // opacity: 0.5,
    wireframe: true,
  })
  const box = new THREE.Mesh(boxGeo, boxMat)
  const p = (i / numBoxes + Math.random() * 0.1) % 1;
  const pos = tubeGeometry.parameters.path.getPointAt(p);
  pos.x += Math.random() - 0.4;
  pos.z += Math.random() - 0.4;
  box.position.copy(pos);
  const rote = new THREE.Vector3(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  box.rotation.set(rote.x, rote.y, rote.z)
  const edges = new THREE.EdgesGeometry(boxGeo, 0.2)
  const color = new THREE.Color().setHSL(1.0 - p, 1, 0.5);
  const linesMat = new THREE.LineBasicMaterial({color})
  const boxLines = new THREE.LineSegments(edges, linesMat)
  boxLines.position.copy(pos);
  boxLines.rotation.set(rote.x, rote.y, rote.z)
  
  // scene.add(box)
  scene.add(boxLines)
  boxes.push(boxLines);

}

function updateCamera(t) {
  const time = t * 0.1
  const looptime = 6 * 1000
  const p = (time % looptime) / looptime
  const pos = tubeGeometry.parameters.path.getPointAt(p)
  const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.03) * 1)
  camera.position.copy(pos)
  camera.lookAt(lookAt)
}

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

function animate(t = 0) {
  requestAnimationFrame(animate)
  updateCamera(t)

  // Rotate each box
  boxes.forEach((box) => {
    box.rotation.x += 0.02; // Adjust speed as needed
    box.rotation.y += 0.06;
  });

  composer.render(scene, camera)
  ctrls.update()
}

animate()

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', handleWindowResize, false)
