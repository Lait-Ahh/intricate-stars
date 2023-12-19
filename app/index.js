import io from 'socket.io-client';
import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer();
const rs = window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
rs();
document.body.appendChild(renderer.domElement);

const socket = io();

function createStar(x, y, id) {
    const group = new THREE.Group();
    group.userData = {
        isStar: true,
        sid: id
    }
    group.position.set(x, y, 0);

    

    scene.add(group);
}

socket.on('position-change', (x, y, id) => {
    const star = scene.children.find(c => c.userData.isStar && c.userData.sid === id);
    if(!star) {
        createStar(x, y, id);
    } else {
        star.position.set(x, y, 0);
    }
});

createStar(window.screenX, window.screenY, 'own');

function animate() {
    requestAnimationFrame(animate);
    socket.emit('update-position', window.screenX, window.screenY);
    scene.children.find(c => c.userData.sid === 'own').position.set(window.screenX, window.screenY, 0);
    renderer.render(scene, camera);
}

animate();