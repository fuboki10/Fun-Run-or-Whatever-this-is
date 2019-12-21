// Collision Detector
import { vec3, mat4, vec4,quat } from 'gl-matrix';
import Mesh from './mesh';
export class AABB {
    public min : vec3;
    public max : vec3;
    public t : mat4;
    constructor(mesh : Mesh) {
        this.min = vec3.fromValues(1,1,1);
        this.max = vec3.fromValues(-1,-1,-1);
        for (let i = 0; i < mesh.vertices.length; i +=3)
        {
            if (mesh.vertices[i] < this.min[0]) this.min[0] = mesh.vertices[i];
            if (mesh.vertices[i] > this.max[0]) this.max[0] = mesh.vertices[i];

            if (mesh.vertices[i+1] < this.min[1]) this.min[1] = mesh.vertices[i+1];
            if (mesh.vertices[i+1] > this.max[1]) this.max[1] = mesh.vertices[i+1];

            if (mesh.vertices[i+2] < this.min[2]) this.min[2] = mesh.vertices[i+2];
            if (mesh.vertices[i+2] > this.max[2]) this.max[2] = mesh.vertices[i+2];
        }
        this.t = mat4.create();
        var sz =  vec3.subtract(vec3.create(),this.max,this.min);
        sz = vec3.scale(vec3.create(), sz , 0.5);
        var c =  vec3.add(vec3.create(),this.max,this.min);
        c = vec3.scale(c,c,0.5);
        console.log("max ",this.max);
        console.log("size ",sz);
        console.log("center ",c);
        this.t = mat4.fromRotationTranslationScale(mat4.create(),quat.create(),vec3.create(),sz);
    }

    draw()
    {

    }
}

export function matbyvec(mata:mat4,vecb:vec4){
    let vec4out=vec4.fromValues(0,0,0,0);
    let flat=mata.entries();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            vec4out[i]+=mata[4*i+j]*vecb[j];
        }
    }
    return vec4out;   
}


export function Collides(a : AABB, b : AABB, mat_a : mat4, mat_b : mat4) : boolean
{
    let meetingAxies = 0; // how many axies are colliding between the AABBs (must be at least 3 to be true)


    let amin = vec4.fromValues(a.min[0], a.min[1], a.min[2],1);
    let amax = vec4.fromValues(a.max[0], a.max[1], a.max[2],1);
    let bmin = vec4.fromValues(b.min[0], b.min[1], b.min[2],1);
    let bmax = vec4.fromValues(b.max[0], b.max[1], b.max[2],1);

    amin = matbyvec(mat_a, amin);
    amax = matbyvec(mat_a, amax);
    bmin = matbyvec(mat_b, bmin);
    bmax = matbyvec(mat_b, bmax);

    if ( (bmin[0] > amin[0]) && (bmin[0] < amax[0]) ) meetingAxies++;
    if ( (bmin[1] > amin[1]) && (bmin[1] < amax[1]) ) meetingAxies++;
    if ( (bmin[2] > amin[2]) && (bmin[2] < amax[2]) ) meetingAxies++;

    return meetingAxies == 3;
}

