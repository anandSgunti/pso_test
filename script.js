import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/webxr/ARButton.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.appendChild(ARButton.createButton(renderer));

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

let reticle;
const reticleGeometry = new THREE.RingGeometry(0.1, 0.15, 32).rotateX(-Math.PI / 2);
const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
reticle.visible = false;
scene.add(reticle);

const addObject = (position) => {
    const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.copy(position);
    scene.add(box);
};

renderer.xr.addEventListener('sessionstart', () => {
    console.log('AR session started');
});

const controller = renderer.xr.getController(0);
controller.addEventListener('select', () => {
    if (reticle.visible) {
        addObject(reticle.position);
    }
});
scene.add(controller);

renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);

    const session = renderer.xr.getSession();
    if (session) {
        const frame = renderer.xr.getFrame();
        const referenceSpace = renderer.xr.getReferenceSpace();

        const viewerPose = frame.getViewerPose(referenceSpace);
        if (viewerPose) {
            const raycaster = new XRRay(viewerPose.transform);
            session.requestHitTestSource({ space: raycaster }).then((source) => {
                const hitTestResults = frame.getHitTestResults(source);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const hitPose = hit.getPose(referenceSpace);

                    if (hitPose) {
                        reticle.visible = true;
                        reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
                    }
                } else {
                    reticle.visible = false;
                }
            });
        }
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
