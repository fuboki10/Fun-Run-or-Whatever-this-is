
import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import * as TextureUtils from '../common/texture-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4, quat } from 'gl-matrix';
import { Vector, Selector, Color, NumberInput, CheckBox } from '../common/dom-utils';


// It is better to create interfaces for each type of light for organization (think of them as structs)
// We simplify things here and consider the light to have only one color
// Also we separate the ambient light into its own light and make it a hemispherical light (the ambient differs according to the direction)
interface AmbientLight {
    type: 'ambient',
    enabled: boolean,
    skyColor: vec3,
    groundColor: vec3,
    skyDirection: vec3
};

interface DirectionalLight {
    type: 'directional',
    enabled: boolean,
    color: vec3,
    direction: vec3
};

interface PointLight {
    type: 'point',
    enabled: boolean,
    color: vec3,
    position: vec3,
    attenuation_quadratic: number,
    attenuation_linear: number,
    attenuation_constant: number
};

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
    outer_cone: number
};

// This union type: it can be any of the specified types
type Light = AmbientLight | DirectionalLight | PointLight | SpotLight;

// This will store the material properties
// To be more consistent with modern workflows, we use what is called albedo to define the diffuse and ambient
// And since specular power (shininess) is in the range 0 to infinity and the more popular roughness paramater is in the range 0 to 1, we read the roughness from the image and convert it to shininess (specular power)
// We also add an emissive properties in case the object itself emits light
// Finally, while the ambient is naturally the same a the diffuse, some areas recieve less ambient than other (e.g. folds), so we use the ambient occlusion texture to darken the ambient in these areas
// We also add tints and scales to control the properties without using multiple textures
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


// In this scene we will draw some textured monkeys with multiple lights using blending and multiple shaders
export default class Dount extends Scene {
    programs: {[name: string]: ShaderProgram} = {};
    camera: Camera;
    controller: FlyCameraController;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    samplers: {[name: string]: WebGLSampler} = {};
    materials: Material[] = [];
    currM: number;
    time: number;
    // We will store the lights here
    lights: Light[] = [
        { type: "ambient", enabled: true, skyColor: vec3.fromValues(0.4, 0.3, 0.4), groundColor: vec3.fromValues(0.1, 0.1, 0.1), skyDirection: vec3.fromValues(0,1,0)},
        { type: 'directional', enabled: true, color: vec3.fromValues(0.9,0.9,0.9), direction:vec3.fromValues(-1,-1,-1) },
    ];

    // And we will store the objects here
    objects: {[name: string]: Object3D} = {};

    public load(): void {
        // All the lights will use the same vertex shader combined with different fragment shaders
        this.game.loader.load({
            ["light.vert"]:{url:'shaders/phong/textured-materials/light.vert', type:'text'},
            ["ambient.frag"]:{url:'shaders/phong/textured-materials/ambient.frag', type:'text'},
            ["directional.frag"]:{url:'shaders/phong/textured-materials/directional.frag', type:'text'},
            ["point.frag"]:{url:'shaders/phong/textured-materials/point.frag', type:'text'},
            ["spot.frag"]:{url:'shaders/phong/textured-materials/spot.frag', type:'text'},
            ["Dount"]:{url:'models/obstacles/spike.obj', type:'text'},
            ["bricks.albedo"]:{url:'images/Bricks/albedo.jpg', type:'image'},
            ["bricks.ao"]:{url:'images/Bricks/AO.jpg', type:'image'},
            ["bricks.roughness"]:{url:'images/Bricks/roughness.jpg', type:'image'},
            ["bricks.specular"]:{url:'images/Bricks/specular.jpg', type:'image'},
        });
    } 
    
    public start(): void {
        this.currM = 0;
        this.time = 0;
        // For each light type, compile and link a shader
        for(let type of ['ambient', 'directional', 'point', 'spot']){
            this.programs[type] = new ShaderProgram(this.gl);
            this.programs[type].attach(this.game.loader.resources['light.vert'], this.gl.VERTEX_SHADER);
            this.programs[type].attach(this.game.loader.resources[`${type}.frag`], this.gl.FRAGMENT_SHADER);
            this.programs[type].link();
        }

        // Load the models
        this.meshes['ground'] = MeshUtils.Plane(this.gl, {min:[0,0], max:[50,50]});
        this.meshes['player'] = MeshUtils.Sphere(this.gl);
        // Load the textures
        this.meshes['Dount'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["Dount"]);
        

        this.materials.push({
                albedo: this.textures['bricks.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['bricks.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['bricks.roughness'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['bricks.ao']});

     

        this.objects['Dount'] = {
            mesh: this.meshes['Dount'],
            material: this.materials[0],
            modelMatrix: mat4.fromRotationTranslationScale(mat4.create(), quat.create(), vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1))
        };




        // Create a regular sampler for textures rendered on the scene objects
        this.samplers['regular'] = this.gl.createSampler();
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);

        // Create a camera and a controller
        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(2,2,2);
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
        this.time +=deltaTime;
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Clear color and depth
        this.objects['Dount'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), 360*this.time/20000, 360*this.time/10000, 360*this.time/100000), vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1))
        let first_light = true;

        for(const light of this.lights){
            if(!light.enabled) continue; // If the light is not enabled, continue

            if(first_light){ // If tihs is the first light, there is no need for blending
                this.gl.disable(this.gl.BLEND);
                first_light = false;
            }else{ // If this in not the first light, we need to blend it additively with all the lights drawn before
                this.gl.enable(this.gl.BLEND);
                this.gl.blendEquation(this.gl.FUNC_ADD);
                this.gl.blendFunc(this.gl.ONE, this.gl.ONE); // This config will make the output = src_color + dest_color
            }

            let program = this.programs[light.type]; // Get the shader to use with this light type
            program.use(); // Use it

            // Send the VP and camera position
            program.setUniformMatrix4fv("VP", false, this.camera.ViewProjectionMatrix);
            program.setUniform3f("cam_position", this.camera.position);

            // Send the light properties depending on its type (remember to normalize the light direction)
            if(light.type == 'ambient'){
                program.setUniform3f(`light.skyColor`, light.skyColor);
                program.setUniform3f(`light.groundColor`, light.groundColor);
                program.setUniform3f(`light.skyDirection`, light.skyDirection);
            } else {
                program.setUniform3f(`light.color`, light.color);
                
                if(light.type == 'directional' || light.type == 'spot'){
                    program.setUniform3f(`light.direction`, vec3.normalize(vec3.create(), light.direction));
                }
                if(light.type == 'point' || light.type == 'spot'){
                    program.setUniform3f(`light.position`, light.position);
                    program.setUniform1f(`light.attenuation_quadratic`, light.attenuation_quadratic);
                    program.setUniform1f(`light.attenuation_linear`, light.attenuation_linear);
                    program.setUniform1f(`light.attenuation_constant`, light.attenuation_constant);
                }
                if(light.type == 'spot'){
                    program.setUniform1f(`light.inner_cone`, light.inner_cone);
                    program.setUniform1f(`light.outer_cone`, light.outer_cone);
                }
            }

            this.objects['Dount'].material = this.materials[0];
            for(let name in this.objects){
                let obj = this.objects[name];
                
                // Create model matrix for the object
                program.setUniformMatrix4fv("M", false, obj.modelMatrix);
                program.setUniformMatrix4fv("M_it", true, mat4.invert(mat4.create(), obj.modelMatrix));
                
                // Send material properties and bind the textures
                program.setUniform3f("material.albedo_tint", obj.material.albedo_tint);
                

                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.albedo);
                this.gl.bindSampler(0, this.samplers['regular']);
                program.setUniform1i("material.albedo", 0);        
                // Draw the object
                obj.mesh.draw(this.gl.TRIANGLES);
            }   
        }
    }
    
    public end(): void {
        const canvas: HTMLCanvasElement = document.querySelector("#text");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let key in this.programs)
            this.programs[key].dispose();
        this.programs = {};
        for(let key in this.meshes)
            this.meshes[key].dispose();
        this.meshes = {};
    }


    /////////////////////////////////////////////////////////
    ////// ADD CONTROL TO THE WEBPAGE (NOT IMPORTNANT) //////
    /////////////////////////////////////////////////////////
   

}