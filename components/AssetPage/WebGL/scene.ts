import * as THREE from 'three';
import { OrbitControls } from './controls/OrbitControls';

function setupScene(id: string) {
  const container = document.getElementById(id);
  console.log(container);

  // this is just for development purposes, so we don't create a new canvas every time the page hot-reloads
  container.innerHTML = '';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);

  const animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  };

  animate();
}

export default function init(id: string) {
  console.log(THREE);

  // TODO: is there a react way of doing this?
  setTimeout(setupScene, 0, id);
}
