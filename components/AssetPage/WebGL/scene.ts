import * as THREE from 'three';
import { OrbitControls, EXRLoader } from 'three-stdlib';
import { GLTFLoader } from './loaders/GLTFLoader';

let scene: THREE.Scene;
let gltfFiles: any;
const material = new THREE.MeshStandardMaterial();

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

  // TODO: reuse webgl context
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  const light = new THREE.HemisphereLight(0xffffff, 0x555555, 1);
  scene.add(light);

  camera.position.z = 0.1;

  const controls = new OrbitControls(camera, renderer.domElement);

  loadModel();
  loadEnvironment(renderer);

  const animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  };

  animate();
}

function loadModel() {
  const gltfLoader = new GLTFLoader();
  const texLoader = new THREE.TextureLoader();

  console.log(gltfFiles);

  // TODO: fix map urls in GLTFLoader so we don't see error warnings
  function getMap(id: string) {
    const keys = Object.keys(gltfFiles.gltf.include);
    let key = keys.find((e) => e.includes(`_${id}_`));

    if (!key) {
      key = keys.find((e) => e.includes(`_arm_`));
    }

    return gltfFiles.gltf.include[key];
  }

  material.map = texLoader.load(getMap('diff').url);
  material.normalMap = texLoader.load(getMap('nor').url);
  material.roughness = 0.1;

  gltfLoader.load(
    gltfFiles.gltf.url,
    function (gltf) {
      scene.add(gltf.scene);
      console.log(gltf);

      gltf.scene.traverse((child) => {
        if (child.type == 'Mesh') {
          const mesh = child as THREE.Mesh;
          mesh.material = material;
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
      }
    );
}

export default function init(id: string, _gltfFiles: any) {
  gltfFiles = _gltfFiles;

  // TODO: is there a react way of doing this?
  setTimeout(setupScene, 0, id);
}
