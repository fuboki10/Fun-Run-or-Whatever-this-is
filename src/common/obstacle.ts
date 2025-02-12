import {Object3D} from '../common/Utils' 
import { AABB } from './CollisionDetector';
import { Key } from 'ts-key-enum';
import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as TextureUtils from '../common/texture-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { physics } from './pyhiscs';
import { vec3, mat4, quat, vec2 } from 'gl-matrix';
import * as MeshUtils from '../common/mesh-utils'


export class Obstacle
{
    Objects:{[name: string]: Object3D} = {};
    type : number;
    mesh : any ;
    constructor(rand:number, zCord:number, textures: {[name:string] : WebGLTexture},gl:WebGL2RenderingContext , Mesh : any,speed:number)
    {
        this.mesh = Mesh;
        this.type = rand;
        if(rand == 1)
        {
            this.Objects[0]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),    
                physics:new physics(vec3.fromValues(-4, 0, zCord), // we will change velocity later
                vec3.fromValues(0.005*speed, 0, 0), true, vec3.fromValues(0, 0, 0))
            };
            this.Objects[1]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(-3, 0, zCord+1), // we will change velocity later
                vec3.fromValues(0.005*speed, 0, 0), true, vec3.fromValues(0, 0, 0))
            }
            // this.Objects[2]={
            //     mesh:this.mesh,    
            //     material: {albedo: textures['snow.albedo'],
            //     albedo_tint: vec3.fromValues(1, 1, 1),
            //     specular: textures['snow.specular'],
            //     specular_tint: vec3.fromValues(1, 1, 1),
            //     roughness: textures['snow.roughness'],
            //     roughness_scale: 1,
            //     emissive: textures['black'],
            //     emissive_tint: vec3.fromValues(1, 1, 1),
            //     ambient_occlusion: textures['white']},
            //     modelMatrix: mat4.create(),
            //     aabb : new AABB(MeshUtils.Cube(gl)),
            //     physics:new physics(vec3.fromValues(-2, 0, zCord+2), // we will change velocity later
            //     vec3.fromValues(0.005, 0, 0), true, vec3.fromValues(0, 0, 0))
            // };
        }
        if (rand == 2)
        {
            this.Objects[0]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(-5, 0, zCord), // we will change velocity later
                vec3.fromValues(-0.001*speed, 0, 0), true, vec3.fromValues(0.0001, 0, 0))
            };
            this.Objects[1]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(5, 0, zCord), // we will change velocity later
                vec3.fromValues(0.001*speed, 0, 0), true, vec3.fromValues(-0.0001, 0, 0))
            };
        }
        if (rand == 3)
        {
            this.Objects[0]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(5, 0, zCord), // we will change velocity later
                vec3.fromValues(-0.01*speed, 0, 0), true, vec3.fromValues(0.0001, 0, 0))
            };
            this.Objects[1]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(-5, 0, zCord+1), // we will change velocity later
                vec3.fromValues(0.01*speed, 0, 0), true, vec3.fromValues(-0.0001, 0, 0))
            };
        }
        if (rand == 4)
        {
            this.Objects[0]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(0, 0, zCord), // we will change velocity later
                vec3.fromValues(0, -0.003*speed, 0), true, vec3.fromValues(0, 0, 0))
            };
            this.Objects[1]={
                mesh:this.mesh,
                material: {albedo: textures['snow.albedo'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: textures['snow.specular'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: textures['snow.roughness'],
                roughness_scale: 1,
                emissive: textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: textures['white']},
                modelMatrix: mat4.create(),
                aabb : new AABB(MeshUtils.Cube(gl)),
                physics:new physics(vec3.fromValues(0, 0, zCord+2), // we will change velocity later
                vec3.fromValues(0, 0.003*speed, 0), true, vec3.fromValues(0, 0, 0))
            };
            // this.Objects[2]={
            //     mesh:this.mesh,
            //     material: {albedo: textures['snow.albedo'],
            //     albedo_tint: vec3.fromValues(1, 1, 1),
            //     specular: textures['snow.specular'],
            //     specular_tint: vec3.fromValues(1, 1, 1),
            //     roughness: textures['snow.roughness'],
            //     roughness_scale: 1,
            //     emissive: textures['black'],
            //     emissive_tint: vec3.fromValues(1, 1, 1),
            //     ambient_occlusion: textures['white']},
            //     modelMatrix: mat4.create(),
            //     aabb : new AABB(MeshUtils.Cube(gl)),
            //     physics:new physics(vec3.fromValues(0, 0, zCord+4), // we will change velocity later
            //     vec3.fromValues(0, -0.003, 0), true, vec3.fromValues(0, 0, 0))
            // };
        }
    }
    public Update(deltaTime:number)
    {
        if (this.type == 1) {
            this.Objects[0].physics.move(deltaTime, vec2.fromValues(5,2), vec2.fromValues(-5,-2));   
            this.Objects[1].physics.move(deltaTime, vec2.fromValues(5,2), vec2.fromValues(-5,-2));
            // this.Objects[2].physics.move(deltaTime, vec2.fromValues(5,2), vec2.fromValues(-5,-2));
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[0].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[1].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            // this.Objects[2].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            // this.Objects[2].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
        }
        if (this.type == 2) {
            this.Objects[0].physics.move(deltaTime,vec2.fromValues(-0.5,2),vec2.fromValues(-5,-2));
            this.Objects[1].physics.move(deltaTime,vec2.fromValues(5,2),vec2.fromValues(0.5,-2));
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),
            quat.create(),//rotation
            this.Objects[0].physics.pos,//postion
            vec3.fromValues(0.5,2,3));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.create(),
            this.Objects[1].physics.pos,vec3.fromValues(0.5,2,3));
        }
        if (this.type == 3) {
            this.Objects[0].physics.move(deltaTime, vec2.fromValues(5,2), vec2.fromValues(-5,-2));
            this.Objects[1].physics.move(deltaTime, vec2.fromValues(5,2), vec2.fromValues(-5,-2));
            
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[0].physics.pos, vec3.fromValues(1.5, 0.5, 0.5));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[1].physics.pos, vec3.fromValues(1.5, 0.5, 0.5));

        }
        if (this.type == 4) {
            this.Objects[0].physics.move(deltaTime, vec2.fromValues(1,5), vec2.fromValues(-1,0));
            this.Objects[1].physics.move(deltaTime, vec2.fromValues(1,2), vec2.fromValues(-1,-3));
            // this.Objects[2].physics.move(deltaTime, vec2.fromValues(1,5), vec2.fromValues(-1,0));
            //console.log(this.Objects[1].physics.pos);
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[0].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[1].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            // this.Objects[2].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            // this.Objects[2].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
        }
    }
}