import * as THREE from 'three';
import { OrbitControls } from './controls/OrbitControls';
import { GLTFLoader } from './loaders/GLTFLoader';

let scene: THREE.Scene;
let gltfFiles: any;

function setupScene(id: string) {
  const container = document.getElementById(id);

  // this is just for development purposes, so we don't create a new canvas every time the page hot-reloads
  container.innerHTML = '';

  scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.01,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  camera.position.z = 1;

  const controls = new OrbitControls(camera, renderer.domElement);

  loadModel();

  const animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  };

  animate();
}

function loadModel() {
  const loader = new GLTFLoader();

  console.log(gltfFiles);

  loader.load(
    gltfFiles.gltf.url,
    function (gltf) {
      scene.add(gltf.scene);
      console.log(gltf);

      gltf.scene.traverse((child) => {
        if (child.type == 'Mesh') {
          const mesh = child as THREE.Mesh;
          mesh.material = new THREE.MeshNormalMaterial();
        }
      });
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );
}

export default function init(id: string, _gltfFiles: any) {
  gltfFiles = _gltfFiles;

  // TODO: is there a react way of doing this?
  setTimeout(setupScene, 0, id);
}
