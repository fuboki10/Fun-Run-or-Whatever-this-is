import { Key } from 'ts-key-enum';
import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import * as TextureUtils from '../common/texture-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4, quat, vec4 } from 'gl-matrix';
import {AABB,matbyvec, Collides, SphereCollides} from '../common/CollisionDetector'

function triangle(x: number): number {
    let i = Math.floor(x);
    return (i%2==0)?(x-i):(1+i-x);
}
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
    modelMatrix: mat4,
    aabb : AABB,
};




export default class TrackScene extends Scene {
    programs: {[name: string]: ShaderProgram} = {};
    camera: Camera;
    controller: FlyCameraController;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    samplers: {[name: string]: WebGLSampler} = {};
    materials: Material[] = [];
    time: number;
    move:boolean;
    currentEffect : string;
    timeobsacles:number;
    lights: Light[] = [
        //{ type: "ambient", enabled: true, skyColor: vec3.fromValues(0.4, 0.3, 0.4), groundColor: vec3.fromValues(0.1, 0.1, 0.1), skyDirection: vec3.fromValues(0,1,0)},
        { type: 'directional', enabled: true, color: vec3.fromValues(0.9,0.9,0.9), direction:vec3.fromValues(-1,-1,-1)},
    ];
    static readonly cubemapDirections = ['xneg', 'yneg', 'zneg', 'xpos', 'ypos', 'zpos'];
    frameBuffer: WebGLFramebuffer; // This will hold the frame buffer object
    readonly shaders = [
        "blit",
        "grayscale",
        "distortion",
        "chrom-aberr",
        "blur",
        "radial-blur",
        "fog",
        "light",
        "edge",
        "invert",
        "kernel"
    ];
    randoms:number[];
    objects: {[name: string]: Object3D} = {};
    obstacletime:number;
    public load(): void {
        // All the lights will use the same vertex shader combined with different fragment shaders
        this.game.loader.load({
            ["mrt.vert"]: { url: 'shaders/mrt.vert', type: 'text' },
            ["mrt.frag"]: { url: 'shaders/mrt.frag', type: 'text' },
            ["light.vert"]:{url:'shaders/phong/textured-materials/light.vert', type:'text'},
            ["ambient.frag"]:{url:'shaders/phong/textured-materials/ambient.frag', type:'text'},
            ["directional.frag"]:{url:'shaders/phong/textured-materials/directional.frag', type:'text'},
            ["point.frag"]:{url:'shaders/phong/textured-materials/point.frag', type:'text'},
            ["spot.frag"]:{url:'shaders/phong/textured-materials/spot.frag', type:'text'},
            ["sky-cube.vert"]:{url:'shaders/sky-cube.vert', type:'text'},
            ["sky-cube.frag"]:{url:'shaders/sky-cube.frag', type:'text'},
            ["fullscreen.vert"]: { url: 'shaders/post-process/fullscreen.vert', type: 'text' },
            ...Object.fromEntries(this.shaders.map((s) => [`${s}.frag`, { url: `shaders/post-process/${s}.frag`, type: 'text' }])),
            ["suzanne"]:{url:'models/Suzanne/Suzanne.obj', type:'text'},
            ["bricks.albedo"]:{url:'images/Bricks/albedo.jpg', type:'image'},
            ["bricks.ao"]:{url:'images/Bricks/AO.jpg', type:'image'},
            ["bricks.roughness"]:{url:'images/Bricks/roughness.jpg', type:'image'},
            ["bricks.specular"]:{url:'images/Bricks/specular.jpg', type:'image'},
            ["ground.albedo"]:{url:'images/ground/albedo.jpg', type:'image'},
            ["ground.ao"]:{url:'images/ground/AO.jpg', type:'image'},
            ["ground.roughness"]:{url:'images/ground/roughness.jpg', type:'image'},
            ["ground.specular"]:{url:'images/ground/specular.jpg', type:'image'},
            ["tire.albedo"]:{url:'images/Tire/albedo.jpg', type:'image'},
            ["tire.roughness"]:{url:'images/Tire/roughness.jpg', type:'image'},
            ["tire.specular"]:{url:'images/Tire/specular.jpg', type:'image'},
            ["tire.ao"]:{url:'images/Tire/AO.jpg', type:'image'},
            ["rune.albedo"]:{url:'images/Rune/albedo.jpg', type:'image'},
            ["rune.roughness"]:{url:'images/Rune/roughness.jpg', type:'image'},
            ["rune.specular"]:{url:'images/Rune/specular.jpg', type:'image'},
            ["rune.ao"]:{url:'images/Rune/AO.jpg', type:'image'},
            ["wood.albedo"]:{url:'images/Wood/albedo.jpg', type:'image'},
            ["wood.roughness"]:{url:'images/Wood/roughness.jpg', type:'image'},
            ["wood.specular"]:{url:'images/Wood/specular.jpg', type:'image'},
            ["wood.ao"]:{url:'images/Wood/ao.jpg', type:'image'},
            ["snow.albedo"]:{url:'images/Snow/albedo.jpg', type:'image'},
            ["snow.roughness"]:{url:'images/Snow/roughness.jpg', type:'image'},
            ["snow.specular"]:{url:'images/Snow/specular.jpg', type:'image'},
            ["snow.ao"]:{url:'images/Snow/ao.jpg', type:'image'},
            ["Spike"]:{url:'models/obstacles/cube.obj',type:'text'},
            ["track"]:{url:'models/track.obj',type:'text'},
            ["house-model"]: { url: 'models/House/House.obj', type: 'text' },
            ...Object.fromEntries(TrackScene.cubemapDirections.map(dir=>[dir, {url:`images/sky box/${dir}.png`, type:'image'}]))
        });
    } 
    
    public start(): void {
        this.time = 0;
        this.obstacletime=0;
        document.addEventListener("keydown", (ev)=>{
            switch(ev.key){
                case Key.Enter:
                    this.move = true;
                    break;
                case ' ':
                    ev.preventDefault();
            }
        })
        document.addEventListener("keyup", (ev)=>{
            switch(ev.key){
                case Key.Enter:
                    this.move = false;
                    break;
                case ' ':
                    ev.preventDefault();
            }
        })
        this.programs["3d"] = new ShaderProgram(this.gl);
        this.programs["3d"].attach(this.game.loader.resources["mrt.vert"], this.gl.VERTEX_SHADER);
        this.programs["3d"].attach(this.game.loader.resources["mrt.frag"], this.gl.FRAGMENT_SHADER);
        this.programs["3d"].link();
        // For each light type, compile and link a shader
        for(let type of ['ambient', 'directional', 'point', 'spot']){
            this.programs[type] = new ShaderProgram(this.gl);
            this.programs[type].attach(this.game.loader.resources['light.vert'], this.gl.VERTEX_SHADER);
            this.programs[type].attach(this.game.loader.resources[`${type}.frag`], this.gl.FRAGMENT_SHADER);
            this.programs[type].link();
        }
        for (let shader of this.shaders) {
            this.programs[shader] = new ShaderProgram(this.gl);
            this.programs[shader].attach(this.game.loader.resources["fullscreen.vert"], this.gl.VERTEX_SHADER);
            this.programs[shader].attach(this.game.loader.resources[`${shader}.frag`], this.gl.FRAGMENT_SHADER);
            this.programs[shader].link();
        }
        this.programs['sky'] = new ShaderProgram(this.gl);
        this.programs['sky'].attach(this.game.loader.resources["sky-cube.vert"], this.gl.VERTEX_SHADER);
        this.programs['sky'].attach(this.game.loader.resources["sky-cube.frag"], this.gl.FRAGMENT_SHADER);
        this.programs['sky'].link();
        
        // Load the models
        this.meshes['ground'] = MeshUtils.Plane(this.gl, {min:[0,0], max:[50,50]});
        this.meshes['player'] = MeshUtils.Sphere(this.gl);
        this.meshes['obstacle1']=MeshUtils.LoadOBJMesh(this.gl,this.game.loader.resources["suzanne"]);
        this.meshes['track']=MeshUtils.LoadOBJMesh(this.gl,this.game.loader.resources["track"]);
        this.meshes['pbb'] = MeshUtils.Cube(this.gl);
        this.meshes['obb'] = MeshUtils.Cube(this.gl);
        this.meshes['cube'] = MeshUtils.Cube(this.gl);
        //this.meshes['obstacle1']=MeshUtils.Cube(this.gl);
        //this.meshes['obstacle1'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["house-model"]);
        // Load the textures
        this.textures['bricks.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['bricks.albedo']);
        this.textures['bricks.ao'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['bricks.ao']);
        this.textures['bricks.roughness'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['bricks.roughness']);
        this.textures['bricks.specular'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['bricks.specular']);
        this.textures['ground.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['ground.albedo']);
        this.textures['ground.ao'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['ground.ao']);
        this.textures['ground.roughness'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['ground.roughness']);
        this.textures['ground.specular'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['ground.specular']);
        this.textures['tire.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['tire.albedo']);
        this.textures['tire.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['tire.albedo']);
        this.textures['tire.roughness'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['tire.roughness']);
        this.textures['tire.specular'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['tire.specular']);
        this.textures['tire.ao'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['tire.ao']);
        this.textures['rune.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['rune.albedo']);
        this.textures['rune.roughness'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['rune.roughness']);
        this.textures['rune.specular'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['rune.specular']);
        this.textures['rune.ao'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['rune.ao']);
        this.textures['wood.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['wood.albedo']);
        this.textures['wood.roughness'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['wood.roughness']);
        this.textures['wood.specular'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['wood.specular']);
        this.textures['wood.ao'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['wood.ao']);
        this.textures['snow.albedo'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['snow.albedo']);
        this.textures['snow.roughness'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['snow.roughness']);
        this.textures['snow.specular'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['snow.specular']);
        this.textures['snow.ao'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['snow.ao']);
        this.textures['white'] = TextureUtils.SingleColor(this.gl, [255, 255, 255, 255]);
        this.textures['black'] = TextureUtils.SingleColor(this.gl, [0, 0, 0, 255]);

        


                  
                
        // Create the 3D ojbects
       this.objects['ground'] = {
            mesh: this.meshes['track'],
            material: {
                albedo: this.textures['ground.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['ground.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['ground.roughness'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['ground.ao']
            },
            modelMatrix: mat4.create(),
            aabb : null
        };

        this.objects['player'] = {
            mesh: this.meshes['player'],
            material: this.game.playerMat,
            modelMatrix: mat4.create(),
            aabb : new AABB(this.meshes['player'])
        };
        this.objects['pbb'] = {
            mesh: this.meshes['pbb'],
            material: this.game.playerMat,
            modelMatrix: mat4.create(),
            aabb : null
        };
        this.objects['obstacle1'] = {
            mesh: this.meshes['obstacle1'],
            material: {albedo: this.textures['snow.albedo'],
            albedo_tint: vec3.fromValues(1, 1, 1),
            specular: this.textures['snow.specular'],
            specular_tint: vec3.fromValues(1, 1, 1),
            roughness: this.textures['snow.roughness'],
            roughness_scale: 1,
            emissive: this.textures['black'],
            emissive_tint: vec3.fromValues(1, 1, 1),
            ambient_occlusion: this.textures['white']},
            modelMatrix: mat4.create(),
            aabb : new AABB(this.meshes['obstacle1'])
        };
        //console.log(this.objects['obstacle1'].aabb);
        this.objects['obb'] = {
            mesh: this.meshes['obb'],
            material: this.game.playerMat,
            modelMatrix: mat4.create(),
            aabb : new AABB(this.meshes['obb'])
        };

        const target_directions = [
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z
        ]

        this.textures['environment'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']); // Here, we will bind the texture to TEXTURE_CUBE_MAP since it will be a cubemap
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false); // No need for UNPACK_FLIP_Y_WEBGL with cubemaps
        for(let i = 0; i < 6; i++){
            // The only difference between the call here and with normal 2D textures, is that the target is one of the 6 cubemap faces, instead of TEXTURE_2D
            this.gl.texImage2D(target_directions[i], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources[TrackScene.cubemapDirections[i]]);
        }
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP); // Then we generate the mipmap

        this.textures['color-target'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['color-target']);
        this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, this.gl.RGBA8, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.textures['color-target2'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['color-target2']);
        this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, this.gl.RGBA8, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.textures['depth-target'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['depth-target']);
        this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, this.gl.DEPTH_COMPONENT32F, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        
        this.frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures['color-target'], 0);
        //this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures['color-target2'], 0);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.textures['depth-target'], 0);
        
        let status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        if (status != this.gl.FRAMEBUFFER_COMPLETE) {
            if (status == this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT)
                console.error("The framebuffer has a type mismatch");
            else if (status == this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)
                console.error("The framebuffer is missing an attachment");
            else if (status == this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS)
                console.error("The framebuffer has dimension mismatch");
            else if (status == this.gl.FRAMEBUFFER_UNSUPPORTED)
                console.error("The framebuffer has an attachment with unsupported format");
            else if (status == this.gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE)
                console.error("The framebuffer has multisample mismatch");
            else
                console.error("The framebuffer has an unknown error");
        }


       
        // Create a regular sampler for textures rendered on the scene objects
        this.samplers['regular'] = this.gl.createSampler();
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);

        this.samplers['postprocess'] = this.gl.createSampler();
        this.gl.samplerParameteri(this.samplers['postprocess'], this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.samplerParameteri(this.samplers['postprocess'], this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.samplerParameteri(this.samplers['postprocess'], this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.samplerParameteri(this.samplers['postprocess'], this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

        // Create a camera and a controller
        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(0,5,2);
        this.camera.direction = vec3.fromValues(0,-1.2,-1);
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
        var a= vec4.fromValues(0,0,0,0);

    }
    
    public draw(deltaTime: number): void
    {
        
        this.controller.update(deltaTime); // Update camera
        if (SphereCollides(1,vec3.create(),this.objects['player'].aabb, this.objects['obb'].aabb, this.objects['player'].modelMatrix,this.objects['obb'].modelMatrix ))
       {
           console.log("aaaaaaaaaaaa");
           this.currentEffect = "grayscale";
       }
       else
       {
         this.currentEffect = "fog";
        if(this.move)
            this.time +=deltaTime;
        this.obstacletime+=deltaTime;
       }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        {
            this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0, this.gl.COLOR_ATTACHMENT1]);
            this.gl.clearBufferfv(this.gl.COLOR, 0, [0.88, 0.65, 0.15, 1]);
            this.gl.clearBufferfv(this.gl.COLOR, 1, [0, 0, 0, 1]);
            this.gl.clearBufferfi(this.gl.DEPTH_STENCIL, 0, 1, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Clear color and depth
            this.objects['ground'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.create(), vec3.fromValues(0, -1, -70), vec3.fromValues(1, 1, 1));
            this.objects['player'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), -360*this.time/1000, 0, 0), vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1))
            this.objects['obstacle1'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, -0*this.obstacletime/10000, 0),
            vec3.fromValues(10*triangle(this.obstacletime/1000),1,-10+this.time/100%20), vec3.fromValues(3, 1, 1));
            var mt1 = mat4.multiply(mat4.create(),this.objects['obstacle1'].modelMatrix,this.objects['obstacle1'].aabb.t);
            var mt2 = mat4.multiply(mat4.create(),this.objects['player'].modelMatrix,this.objects['player'].aabb.t);
            this.objects['obb'].modelMatrix = mt1;
            this.objects['pbb'].modelMatrix = mat4.create();//mat4.fromRotationTranslationScale(mt2,quat.fromEuler(quat.create(), -360*this.time/1000, 0, 0),vec3.create(),vec3.fromValues(1,1,1));
            
        

            let first_light = true;
            console.log(this.lights.length);
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

                for(let name in this.objects)
                {
                    let obj = this.objects[name];

                    // Create model matrix for the object
                    program.setUniformMatrix4fv("M", false, obj.modelMatrix);
                    program.setUniformMatrix4fv("M_it", true, mat4.invert(mat4.create(), obj.modelMatrix));
                    
                    // Send material properties and bind the textures
                    program.setUniform3f("material.albedo_tint", obj.material.albedo_tint);
                    program.setUniform3f("material.specular_tint", obj.material.specular_tint);
                    program.setUniform3f("material.emissive_tint", obj.material.emissive_tint);
                    program.setUniform1f("material.roughness_scale", obj.material.roughness_scale);

                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.albedo);
                    this.gl.bindSampler(0, this.samplers['regular']);
                    program.setUniform1i("material.albedo", 0);

                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.specular);
                    this.gl.bindSampler(1, this.samplers['regular']);
                    program.setUniform1i("material.specular", 1);

                    this.gl.activeTexture(this.gl.TEXTURE2);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.roughness);
                    this.gl.bindSampler(2, this.samplers['regular']);
                    program.setUniform1i("material.roughness", 2);

                    this.gl.activeTexture(this.gl.TEXTURE3);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.emissive);
                    this.gl.bindSampler(3, this.samplers['regular']);
                    program.setUniform1i("material.emissive", 3);

                    this.gl.activeTexture(this.gl.TEXTURE4);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.ambient_occlusion);
                    this.gl.bindSampler(4, this.samplers['regular']);
                    program.setUniform1i("material.ambient_occlusion", 4);
                    
                    // Draw the object
                    if (name == 'obb' )
                    {
                        obj.mesh.draw(this.gl.LINE_LOOP);
                    }
                    else if (name == 'pbb' )
                    {

                    }
                    else
                        obj.mesh.draw(this.gl.TRIANGLES);
                } 
                
                if(true){
                    this.gl.cullFace(this.gl.FRONT);
                    this.gl.depthMask(false);
        
                    this.programs['sky'].use();
        
                    this.programs['sky'].setUniformMatrix4fv("VP", false, this.camera.ViewProjectionMatrix);
                    this.programs['sky'].setUniform3f("cam_position", this.camera.position);
        
                    let skyMat = mat4.create();
                    mat4.translate(skyMat, skyMat, this.camera.position);
                    
                    this.programs['sky'].setUniformMatrix4fv("M", false, skyMat);
        
                    this.programs['sky'].setUniform4f("tint", [1, 1, 1, 1]);
        
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']);
                    this.programs['sky'].setUniform1i('cube_texture_sampler', 0);
                    this.gl.bindSampler(0, this.samplers['regular']);
        
                    this.meshes['cube'].draw(this.gl.TRIANGLES);
                    
                    this.gl.cullFace(this.gl.BACK);
                    this.gl.depthMask(true);
                } 
                
            }
        }
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        {
            this.gl.clearColor(0.08, 0.32, 0.44, 1);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            this.gl.bindSampler(0, this.samplers['postprocess']);
            this.gl.bindSampler(1, this.samplers['postprocess']);

            let program: ShaderProgram;
            
            switch (this.currentEffect) {
                case "none": // This will draw the color target as is
                    program = this.programs['blit'];
                    program.use();
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['color-target']);
                    program.setUniform1i('color_sampler', 0);
                    break;
                case "grayscale": // This will apply a grayscale operation on the color before rendering it
                    program = this.programs['grayscale'];
                    program.use();
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['color-target']);
                    program.setUniform1i('color_sampler', 0);
                    break;
                case "kernel":  // This will blur the color target using a 2D Gaussian Blur
                    program = this.programs['kernel'];
                    program.use();
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['color-target']);
                    program.setUniform1i('color_sampler', 0);
                    break;
                case "fog": // This will use the depth target to reconstruct the view position and add fog to the scene
                    program = this.programs['fog'];
                    program.use();
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['color-target']);
                    program.setUniform1i('color_sampler', 0);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['depth-target']);
                    program.setUniform1i('depth_sampler', 1);
                    program.setUniform1f('fog_distance', 10);
                    program.setUniform4f('fog_color', [0.4, 0.4, 0.4, 1]);
                    program.setUniformMatrix4fv('P_i', false, mat4.invert(mat4.create(), this.camera.ProjectionMatrix));
                    break;
                default:
                    this.gl.useProgram(null);
            }

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        }
       
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

