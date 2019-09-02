import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { GUI }from "dat.gui";
import * as SCENES from "./scenes/index.js";

// Build a world
export const build = (width, height, pixelRatio) => {

    const camera = new THREE.PerspectiveCamera(100, width / height, 1);
    camera.position.z = -5;
    camera.position.y = 0;
    camera.updateMatrix();

    const devCamera = new THREE.PerspectiveCamera(100, width / height, 1);
    devCamera.position.z = 5;
    devCamera.position.y = 0;
    devCamera.updateMatrix();

    const cameraHelper = new THREE.CameraHelper(camera);
    cameraHelper.name = "__cameraHelper";

    const scenes = SCENES.build();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(0, 0, 0));
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.autoClear = false;

    var orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    orbit.update();

    return {
        camera: camera,
        devCamera: devCamera,
        cameraHelper: cameraHelper,
        renderer: renderer,
        orbit: orbit,
        scenes: scenes,
        currentScene: 0,
        frameId: 0,
        toolsEnabled: false,
    };
}

export const render = (world) => {
    const camera = world.camera; 
    const devCamera = world.devCamera; 
    const renderer = world.renderer;
    const scenes = world.scenes;
    const sceneId = world.currentScene;

    const vector = world.renderer.getSize(new THREE.Vector3(0,0,0));

    const width = vector.x;
    const height = vector.y;

    if (!world.toolsEnabled)
    {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setViewport(0, 0, width , height);
      renderer.render(scenes[sceneId].scene, camera);
    }
    else
    {
      camera.aspect = 0.5 * width / height;
      camera.updateProjectionMatrix();
  
      devCamera.aspect = 0.5 * width / height;
      devCamera.updateProjectionMatrix();
      
      renderer.setViewport(0, 0, width / 2 , height);
      renderer.render(scenes[sceneId].scene, camera);
      
      renderer.setViewport(width / 2, 0, width / 2, height);
      renderer.render(scenes[sceneId].scene, devCamera);
    }
}

  // Animate the world
export const animate = (world) => {
    const camera = world.camera; 
    const devCamera = world.devCamera; 
    const scenes = world.scenes;

    scenes.map(scene => {
      scene.animate();
      camera.lookAt(scene.scene.position);
      devCamera.lookAt(scene.scene.position);
      return true;
    });
};

export const handleResize = (world, width, height) => {
    world.renderer.setSize(width, height);

    if (world.toolsEnabled)
    {
        world.camera.aspect = 0.5 * width / height;
        world.devCamera.aspect = 0.5 * width / height;
    }
    else
    {
        world.camera.aspect = width / height;
        world.devCamera.aspect = width / height;
    }
    
    world.camera.updateProjectionMatrix();
    world.devCamera.updateProjectionMatrix();
};

export const changeScene = (world) => {
    if (world.currentScene > world.scenes.length - 2) world.currentScene = 0;
    else world.currentScene++;
};

export const toggleTools = (world) => {
    const scene = world.scenes[world.currentScene].scene;
    const helper = scene.getObjectByName("__cameraHelper");

    world.renderer.clear();

    if (!helper)
    {
      scene.add(world.cameraHelper);
      world.toolsEnabled = true;
    }
    else
    {
      scene.remove(helper);
      world.toolsEnabled = false;
    }
}

