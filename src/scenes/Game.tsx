import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4 } from 'gl-matrix';
import { Vector, Selector, Color, NumberInput, CheckBox } from '../common/dom-utils';
import { createElement } from 'tsx-create-element';

interface AmbientLight {
    type: 'ambient',
    enabled: boolean,
    skyColor: vec3,
    groundColor: vec3,
    skyDirection: vec3,
    hasShadow: false // Ambient lights can't have shadow (they actually have shadow but they are hard to implement in realtime)
};

// Here, we will implement Cascaded Shadow Maps for Directional Lights
interface DirectionalLight {
    type: 'directional',
    enabled: boolean,
    color: vec3,
    direction: vec3
    hasShadow: boolean,
    shadowMaps: WebGLTexture[], // This will store the shadow map for each cascade
    shadowVPs: mat4[], // This will store the View Projection matrix for each cascade
    cascades: number[], // This will store the cascade distance (how much far from the camera does a shadow map cover)
    shadowMapResolution: number, // The resolution of each shadow map
    shadowBias: number, // The shadow bias (will be explained later in the code)
    shadowSlopeBias: number, // The shadow slope (will be explained later in the code)
    shadowDistance: number // How far along the shadow direction can the shadow map cover
};

// Here, we will implement Cube Shadow Maps for Point Lights
interface PointLight {
    type: 'point',
    enabled: boolean,
    color: vec3,
    position: vec3,
    attenuation_quadratic: number,
    attenuation_linear: number,
    attenuation_constant: number,
    hasShadow: boolean,
    shadowMaps: WebGLTexture[], // This will store the shadow map for each direction (6 faces in total)
    shadowVPs: mat4[], // This will store the View Projection matrix for each direction
    shadowMapResolution: number, // The resolution of each shadow map
    shadowBias: number, // The shadow bias (will be explained later in the code)
    shadowSlopeBias: number, // The shadow slope (will be explained later in the code)
    shadowNear: number, // The nearest depth the shadow can see
    shadowFar: number // The farthest depth the shadow can see
};

// Here, we will implement Shadow Maps for Spot Lights
interface SpotLight {
    type: 'spot',
    enabled: boolean,
    color: vec3,
    position: vec3,
    direction: vec3,
    attenuation_quadratic: number,
    attenuation_linear: number,
    attenuation_constant: number,
    inner_cone: number,
    outer_cone: number,
    hasShadow: boolean,
    shadowMaps: WebGLTexture[], // This will store the shadow map (we only need 1 but we still use an array to be consistent with other light types)
    shadowVPs: mat4[], // This will store the View Projection matrix (we also need only one)
    shadowMapResolution: number, // The resolution of the shadow map
    shadowBias: number, // The shadow bias (will be explained later in the code)
    shadowSlopeBias: number, // The shadow slope (will be explained later in the code)
    shadowNear: number, // The nearest depth the shadow can see
    shadowFar: number // The farthest depth the shadow can see
};

// This union type: it can be any of the specified types
type Light = AmbientLight | DirectionalLight | PointLight | SpotLight;

// The material properties are the same as TexturedModelsScene
interface Material {
    albedo: WebGLTexture,
    albedo_tint: vec3,
    specular: WebGLTexture,
    specular_tint: vec3
    roughness: WebGLTexture,
    roughness_scale: number,
    ambient_occlusion: WebGLTexture,
    emissive: WebGLTexture,
    emissive_tint: vec3
};



// This will represent an object in 3D space
interface Object3D {
    mesh: Mesh,
    material: Material,
    modelMatrix: mat4
};


export default class GameScene extends Scene {
    programs: {[name: string]: ShaderProgram} = {};
    camera: Camera;
    controller: FlyCameraController;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    samplers: {[name: string]: WebGLSampler} = {};
    frameBuffer: WebGLFramebuffer; // We need a frame buffer to draw shadow maps

    // We will store the lights here
    lights: Light[] = [
        { type: "ambient", enabled: true, skyColor: vec3.fromValues(0.2, 0.3, 0.4), groundColor: vec3.fromValues(0.1, 0.1, 0.1), skyDirection: vec3.fromValues(0,1,0), hasShadow: false},
        { type: 'directional', enabled: true, color: vec3.fromValues(0.5,0.5,0.5), direction:vec3.fromValues(-1,-1,-1), hasShadow: true, shadowMaps:[], shadowVPs: [], cascades: [2, 10, 100], shadowMapResolution: 1024, shadowBias: 1, shadowSlopeBias: 1.5, shadowDistance: 800 },
        { type: 'point', enabled: true, color: vec3.fromValues(10,8,2), position:vec3.fromValues(0,2.5,0), attenuation_quadratic:0, attenuation_linear:1, attenuation_constant:0, hasShadow: true, shadowMaps:[], shadowVPs: [], shadowMapResolution: 256, shadowBias: 1, shadowSlopeBias: 1.5, shadowNear: 0.01, shadowFar: 100 },
        { type: 'spot', enabled: true, color: vec3.fromValues(5,0,0), position:vec3.fromValues(-2,4,6), direction:vec3.fromValues(0,-1,-1), attenuation_quadratic:0, attenuation_linear:1, attenuation_constant:0, inner_cone: 0.25*Math.PI, outer_cone: 0.3*Math.PI, hasShadow: true, shadowMaps:[], shadowVPs: [], shadowMapResolution: 512, shadowBias: 1, shadowSlopeBias: 1.5, shadowNear: 0.01, shadowFar: 100 },
    ];

    // And we will store the objects here
    objects: {[name: string]: Object3D} = {};

    public load(): void {
        // We need one big shader specifically designed to do all the lighting
        this.game.loader.load({
            ["vert"]:{url:'shaders/phong/multiple-lights/lights.vert', type:'text'},
            ["frag"]:{url:'shaders/phong/multiple-lights/lights.frag', type:'text'},
            ["suzanne"]:{url:'models/Suzanne/Suzanne.obj', type:'text'},
        });
    }

    public start(): void {
        // Create a camera and a controller
        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(5,5,5);
        this.camera.direction = vec3.fromValues(-1,-1,-1);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
          
        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.01;

        // As usual, we enable face culling and depth testing
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
 
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
 
        // Use a dark grey clear color
        this.gl.clearColor(0.1,0.1,0.1,1);
    }

    public draw(deltaTime: number): void {
        this.controller.update(deltaTime); // Update camera

    }

    public end(): void {
        for(let key in this.programs)
            this.programs[key].dispose();
        this.programs = {};
        for(let key in this.meshes)
            this.meshes[key].dispose();
        this.meshes = {};
    }
}