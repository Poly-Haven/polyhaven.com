import * as THREE from "three";

function setupScene(id: string) {
    const container = document.getElementById(id);
    console.log(container)

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( container.clientWidth, container.clientHeight );
    container.appendChild( renderer.domElement );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    const animate = function () {
        requestAnimationFrame( animate );

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render( scene, camera );
    };

    animate();
}

export default function init(id: string) {
    console.log(THREE);

    setTimeout(setupScene, 0, id);
}