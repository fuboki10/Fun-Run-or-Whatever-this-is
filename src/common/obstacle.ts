import {Object3D} from '../common/Utils' 
import { AABB } from './CollisionDetector';
import { physics } from './pyhiscs';
import { vec3, mat4, quat, vec2 } from 'gl-matrix';
import * as MeshUtils from '../common/mesh-utils'


export class Obstacle
{
    Objects: Object3D;
    type : number;
    constructor(rand:number, zCord:number, textures: {[name:string] : WebGLTexture},gl:WebGL2RenderingContext)
    {
        this.type = rand;
        if(rand == 1)
        {
            this.Objects=[{
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(0.0001, 0, 0), true, vec3.fromValues(0, 0, 0))
            },
            {
                mesh:MeshUtils.Cube(gl),
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
                physics:new physics(vec3.fromValues(5, 0, zCord+1), // we will change velocity later
                vec3.fromValues(0.0001/3, 0, 0), true, vec3.fromValues(0, 0, 0))
            },
            {
                mesh:MeshUtils.Cube(gl),
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
                physics:new physics(vec3.fromValues(5, 0, zCord+2), // we will change velocity later
                vec3.fromValues(0.0001/6, 0, 0), true, vec3.fromValues(0, 0, 0))
            }];
        }
        if (rand == 2)
        {
            this.Objects=[{
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(0.0001, 0, 0), true, vec3.fromValues(0, 0, 0))
            },
            {
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(-0.0001, 0, 0), true, vec3.fromValues(0, 0, 0))
            }];
        }
        if (rand == 3)
        {
            this.Objects=[{
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(-0.0001, 0, 0), true, vec3.fromValues(0, 0, 0))
            },
            {
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(0.0001, 0, 0), true, vec3.fromValues(0, 0, 0))
            }];
        }
        if (rand == 4)
        {
            this.Objects=[{
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(0, -0.001, 0), true, vec3.fromValues(0, 0, 0))
            },
            {
                mesh:MeshUtils.Cube(gl),
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
                physics:new physics(vec3.fromValues(0, 0, zCord+1), // we will change velocity later
                vec3.fromValues(0, 0.0001, 0), true, vec3.fromValues(0, 0, 0))
            },
            {
                mesh:MeshUtils.Cube(gl),
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
                vec3.fromValues(0, -0.0001, 0), true, vec3.fromValues(0, 0, 0))
            }];
        }
    }
    public Update(deltaTime:number)
    {
        if (this.type == 1) {
            this.Objects[0].physics.move(deltaTime, vec2.fromValues(5,0), vec2.fromValues(-5,0));   
            console.log(this.Objects[0].physics.speed)
            this.Objects[1].physics.move(deltaTime, vec2.fromValues(5,0), vec2.fromValues(-5,0));
            this.Objects[2].physics.move(deltaTime, vec2.fromValues(5,0), vec2.fromValues(-5,0));
            
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[0].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[1].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[2].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[2].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
        }
        if (this.type == 2) {
            this.Objects[0].physics.move(deltaTime/1000,vec2.fromValues(-0.5,0),vec2.fromValues(-5,0));
            this.Objects[1].physics.move(deltaTime/1000,vec2.fromValues(5,0),vec2.fromValues(0.5,0));
            
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),
            quat.create(),//rotation
            this.Objects[0].physics.pos,//postion
            vec3.fromValues(0.5,2,3));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.create(),
            this.Objects[1].physics.pos,vec3.fromValues(0.5,2,3));
        }
        if (this.type == 3) {
            this.Objects[0].physics.move(deltaTime, vec2.fromValues(5,0), vec2.fromValues(-5,0));
            this.Objects[1].physics.move(deltaTime, vec2.fromValues(5,0), vec2.fromValues(-5,0));
            
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[0].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[1].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[2].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[2].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
        }
        if (this.type == 4) {
            this.Objects[0].physics.move(deltaTime, vec2.fromValues(0,5), vec2.fromValues(0,-5));
            this.Objects[1].physics.move(deltaTime, vec2.fromValues(0,5), vec2.fromValues(0,-5));
            this.Objects[2].physics.move(deltaTime, vec2.fromValues(0,5), vec2.fromValues(0,-5));
            
            this.Objects[0].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[0].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[1].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[1].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
            this.Objects[2].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(),quat.fromEuler(quat.create(), 0, 0, 0),
            this.Objects[2].physics.pos, vec3.fromValues(1.5, 0.5, 1.5));
        }
    }
}