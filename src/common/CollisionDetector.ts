// Collision Detector
import { vec3, mat4, vec4 } from 'gl-matrix';

export class AABB {
    public min : vec4;
    public max : vec4;
    constructor(min : vec4, max : vec4) {
        this.min = min;
        this.max = max;
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


export function Collides(mat_a : mat4, mat_b : mat4) : boolean
{
    let meetingAxies = 0; // how many axies are colliding between the AABBs (must be at least 3 to be true)

    let min_a = vec4.fromValues(-1, -1, -1, 1);
    let min_b = vec4.fromValues(-1, -1, -1, 1);
    let max_a = vec4.fromValues(1, 1, 1, 1);
    let max_b = vec4.fromValues(1, 1, 1, 1);

    min_a = matbyvec(mat_a, min_a);
    max_a = matbyvec(mat_a, max_a);
    min_b = matbyvec(mat_b, min_b);
    max_b = matbyvec(mat_b, max_b);
    
    let a = new AABB(min_a, max_a);
    let b = new AABB(min_b, max_b);


    if ( (b.min[0] > a.min[0]) && (b.min[0] < a.max[0]) ) meetingAxies++;
    if ( (b.min[1] > a.min[1]) && (b.min[1] < a.max[1]) ) meetingAxies++;
    if ( (b.min[2] > a.min[2]) && (b.min[2] < a.max[2]) ) meetingAxies++;

    if ( (a.min[0] > b.min[0]) && (a.min[0] < b.max[0]) ) meetingAxies++;
    if ( (a.min[1] > b.min[1]) && (a.min[1] < b.max[1]) ) meetingAxies++;
    if ( (a.min[2] > b.min[2]) && (a.min[2] < b.max[2]) ) meetingAxies++;

    return meetingAxies == 3;
}

export function matbyvec(mata:mat4,vecb:vec4){
    let vec4out=vec4.fromValues(0,0,0,0);
    let flat=mata.entries();
    console.log(mata[4]);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            vec4out[i]+=mata[4*i+j]*vecb[j];
        }
    }
    return vec4out;   
}
