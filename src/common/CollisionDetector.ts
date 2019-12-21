// Collision Detector
import { vec3, mat4, vec4 } from 'gl-matrix';
import Mesh from './mesh';
export class AABB {
    public min : vec3;
    public max : vec3;
    constructor(mesh : Mesh) {
        this.min[0] = this.max[0] = mesh.vertices[0];
        this.min[1] = this.max[1] = mesh.vertices[1];
        this.min[2] = this.max[2] = mesh.vertices[2];
        for (let i = 0; i < mesh.vertices.length; i +=3)
        {
            if (mesh.vertices[i] < this.min[0]) this.min[0] = mesh.vertices[i];
            if (mesh.vertices[i] > this.max[0]) this.max[0] = mesh.vertices[i];

            if (mesh.vertices[i+1] < this.min[1]) this.min[1] = mesh.vertices[i+1];
            if (mesh.vertices[i+1] > this.max[1]) this.max[1] = mesh.vertices[i+1];

            if (mesh.vertices[i+2] < this.min[2]) this.min[2] = mesh.vertices[i+2];
            if (mesh.vertices[i+2] > this.max[2]) this.max[2] = mesh.vertices[i+2];
        }
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


export function Collides(a : AABB, b : AABB) : boolean
{
    let meetingAxies = 0; // how many axies are colliding between the AABBs (must be at least 3 to be true)

  


    if ( (b.min[0] > a.min[0]) && (b.min[0] < a.max[0]) ) meetingAxies++;
    if ( (b.min[1] > a.min[1]) && (b.min[1] < a.max[1]) ) meetingAxies++;
    if ( (b.min[2] > a.min[2]) && (b.min[2] < a.max[2]) ) meetingAxies++;

    return meetingAxies == 3;
}

