// Information:
// - doesn't work with ARM maps yet
// - russian_food_cans_01

import * as THREE from 'three';
import { OrbitControls, EXRLoader } from 'three-stdlib';
import { GLTFLoader } from './loaders/GLTFLoader';

let scene: THREE.Scene;
let gltfFiles: any;
let renderer: THREE.WebGLRenderer;
const material = new THREE.MeshStandardMaterial();
const diffuseMaterial = new THREE.MeshBasicMaterial();
diffuseMaterial.toneMapped = false;
const normalMaterial = new THREE.MeshBasicMaterial();
normalMaterial.toneMapped = false;
const roughMaterial = new THREE.MeshBasicMaterial();
roughMaterial.toneMapped = false;

let meshes: THREE.Mesh[];
let mapsMaterials: THREE.MeshBasicMaterial[];
let wireframes: THREE.LineSegments[];

function setupScene(id: string) {
  const inner_container = document.getElementById(id);
  const container = document.getElementById('preview-container');

  // this is just for development purposes, so we don't create a new canvas every time the page hot-reloads
  if (inner_container) inner_container.innerHTML = '';

  // clear arrays every time the scene is setup, so we don't have any objects from previous scenes in them
  meshes = [];
  mapsMaterials = [];
  wireframes = [];

  scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / inner_container.clientHeight,
    0.01,
    1000
  );

  // TODO: reuse webgl context
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  }

  // TODO: resizing when window size changes
  renderer.setSize(container.clientWidth, inner_container.clientHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.physicallyCorrectLights = true;
  renderer.toneMappingExposure = 2;

  inner_container.appendChild(renderer.domElement);

  camera.position.z = 0.1;

  const controls = new OrbitControls(camera, renderer.domElement);

  loadModel();
  loadEnvironment(renderer);

  const animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  };

  animate();

  document.addEventListener('keydown', handleKeydown);
}

function loadModel() {
  const gltfLoader = new GLTFLoader();
  const texLoader = new THREE.TextureLoader();

  console.log(gltfFiles);

  setMapIfExists('diff', 'map', diffuseMaterial);
  setMapIfExists('nor', 'normalMap', normalMaterial);
  setMapIfExists('rough', 'roughnessMap', roughMaterial);

  gltfLoader.load(
    gltfFiles.gltf.url,
    function (gltf) {
      scene.add(gltf.scene);
      console.log(gltf);

      gltf.scene.traverse((child) => {
        if (child.type == 'Mesh') {
          const mesh = child as THREE.Mesh;
          mesh.material = material;
          meshes.push(mesh);

          const wireframeGeo = new THREE.WireframeGeometry(mesh.geometry); // or WireframeGeometry
          const wireframeMat = new THREE.LineBasicMaterial({ color: 0x000000 });
          const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
          wireframe.visible = false;
          mesh.add(wireframe);
          wireframes.push(wireframe);
        }
      });
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.error(error);
    }
  );

  // ===============
  // LOCAL FUNCTIONS

  function getMap(id: string) {
    const keys = Object.keys(gltfFiles.gltf.include);
    let key = keys.find((e) => e.includes(`_${id}_`));

    return gltfFiles.gltf.include[key];
  }

  function setMapIfExists(
    id: string,
    map: string,
    previewMaterial: THREE.MeshBasicMaterial
  ) {
    if (getMap(id)) {
      const _map = texLoader.load(getMap(id).url);
      _map.flipY = false;
      material[map] = _map;
      previewMaterial.map = _map;
      mapsMaterials.push(previewMaterial);
    }
  }
}

function loadEnvironment(renderer) {
  new EXRLoader()
    .setDataType(THREE.UnsignedByteType)
    .load(
      'https://dl.polyhaven.com/file/ph-assets/HDRIs/exr/1k/phalzer_forest_01_1k.exr',
      function (texture) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);

        const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        const exrBackground = exrCubeRenderTarget.texture;

        texture.dispose();
        material.envMap = exrBackground;
        scene.background = exrBackground;
      }
    );
}

export default function init(id: string, _gltfFiles: any) {
  gltfFiles = _gltfFiles;

  // TODO: is there a react way of doing this?
  setTimeout(setupScene, 0, id);
}

let mapsMaterialsIndex = 0;

function handleKeydown(e: KeyboardEvent) {
  if (e.isComposing) {
    return;
  }

  switch (e.key) {
    // show PBR material
    case '1':
      meshes.forEach((mesh) => {
        mesh.material = material;
      });
      break;

    // cycle through maps
    case '2':
      if (meshes[0].material == material) {
        mapsMaterialsIndex = 0;
      }
      meshes.forEach((mesh) => {
        mesh.material = mapsMaterials[mapsMaterialsIndex];
      });

      mapsMaterialsIndex++;
      mapsMaterialsIndex %= mapsMaterials.length;
      break;

    // toggle  wireframe
    case '5':
      wireframes.forEach((w) => {
        w.visible = !w.visible;
      });
      break;
  }
}
