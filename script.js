// Ensure you include Three.js and its WebXR helpers in your project
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Add AR Button for enabling AR mode
document.body.appendChild(ARButton.createButton(renderer));

// Lighting for the scene
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Reticle for detecting horizontal surfaces
let reticle;
const reticleGeometry = new THREE.RingGeometry(0.1, 0.15, 32).rotateX(-Math.PI / 2);
const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
reticle.visible = false;
scene.add(reticle);

// Function to add an object at the detected surface
const addObject = (position) => {
    const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.copy(position);
    scene.add(box);
};

// Handle AR session events
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

// Animation loop
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);

    // Update the reticle based on AR hit testing
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

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
