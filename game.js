// Super Saudi Drift 2.0 - Core Game Prototype
// JavaScript + Three.js
// Always-in-Car Arabian Drift Chaos

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.136.0/examples/jsm/loaders/OBJLoader.js';

let scene, camera, renderer, car, keys = {}, speed = 0, drift = 0, crashSound, chaosText;
let carModel, carColor = 0xff0000;  // Initial car color

init();
animate();

function init() {
  // Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue for open world feel

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, -10);

  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  // Create Open World Terrain (simple plane)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshLambertMaterial({ color: 0x228B22 }) // Green grass
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Load car model (car_model.obj)
  const objLoader = new OBJLoader();
  objLoader.load('assets/car_model.obj', (obj) => {
    car = obj;
    car.scale.set(0.5, 0.5, 0.5); // Resize car model to fit the scene
    scene.add(car);
  });

  // Cones (badly placed obstacles)
  for (let i = 0; i < 20; i++) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1, 6),
      new THREE.MeshLambertMaterial({ color: 0xff9900 })
    );
    cone.position.set(Math.random() * 100 - 50, 0.5, Math.random() * 100 - 50);
    cone.rotation.x = Math.random();
    cone.rotation.z = Math.random();
    cone.name = "obstacle";
    scene.add(cone);
  }

  // Exploding barrels
  for (let i = 0; i < 5; i++) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8),
      new THREE.MeshLambertMaterial({ color: 0xaa0000 })
    );
    barrel.position.set(Math.random() * 50 - 25, 0.6, Math.random() * 50 - 25);
    barrel.name = "explode";
    scene.add(barrel);
  }

  // UI for chaos messages
  chaosText = document.createElement('div');
  chaosText.style.position = 'absolute';
  chaosText.style.top = '20px';
  chaosText.style.left = '50%';
  chaosText.style.transform = 'translateX(-50%)';
  chaosText.style.fontSize = '30px';
  chaosText.style.color = 'red';
  chaosText.style.fontFamily = 'monospace';
  document.body.appendChild(chaosText);

  // Audio - fake Arabic trap beat and crash sound
  const bgMusic = new Audio('https://filesamples.com/samples/audio/mp3/sample3.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.3;
  bgMusic.play();

  crashSound = new Audio('https://freesound.org/data/previews/341/341695_626119-lq.mp3');
  crashSound.volume = 0.5;

  // Controls
  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function showChaosMessage(msg) {
  chaosText.textContent = msg;
  setTimeout(() => chaosText.textContent = '', 1500);
}

function animate() {
  requestAnimationFrame(animate);

  let forward = keys['w'] ? 0.2 : (keys['s'] ? -0.1 : 0);
  speed += forward;
  speed *= 0.96; // friction

  let turn = 0;
  if (keys['a']) turn = 0.03;
  if (keys['d']) turn = -0.03;

  if (car) {
    car.rotation.y += turn * (speed > 0 ? 1 : -1);

    let dx = Math.sin(car.rotation.y) * speed;
    let dz = Math.cos(car.rotation.y) * speed;
    car.position.x += dx;
    car.position.z += dz;
  }

  // Collision detection with obstacles (e.g., barrels or cones)
  scene.children.forEach(obj => {
    const dist = car.position.distanceTo(obj.position);
    if (obj.name === "obstacle" && dist < 2) {
      crashSound.play();
      speed = -speed * 0.3;
      obj.rotation.x += 0.5;
      obj.rotation.z += 0.5;
      showChaosMessage("DRIFT FAIL!");
    }
    if (obj.name === "explode" && dist < 2) {
      obj.material.color.set(0xffff00);
      showChaosMessage("🔥 BOOM! 🔥");
      speed = -1;
    }
  });

  // Fake bad camera follow
  if (car) {
    camera.position.lerp(
      new THREE.Vector3(car.position.x, car.position.y + 5, car.position.z - 10), 0.05
    );
    camera.lookAt(car.position);
  }

  renderer.render(scene, camera);
}
