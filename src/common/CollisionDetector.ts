// Collision Detector
import { vec3, mat4, vec4 } from 'gl-matrix';
import Mesh from '../common/mesh';

export class AABB {
    public min : vec3;
    public max : vec3;
    constructor(min : vec3, max : vec3) {
        this.min = min;
        this.max = max;
    }
}


export function Collides(mat_a : mat4, mat_b : mat4) : boolean
{
    let meetingAxies = 0; // how many axies are colliding between the AABBs (must be at least 3 to be true)

    let min_a = vec3.fromValues(-1, -1, -1);
    let min_b = vec3.fromValues(-1, -1, -1);
    let max_a = vec3.fromValues(1, 1, 1);
    let max_b = vec3.fromValues(1, 1, 1);

    vec3.transformMat4(min_a, min_a, mat_a);
    vec3.transformMat4(max_a, max_a, mat_a);
    vec3.transformMat4(min_b, min_b, mat_b);
    vec3.transformMat4(max_b, max_b, mat_b);

    let a = new AABB(min_a, max_a);
    let b = new AABB(min_b, max_b);

    if ( (b.min[0] > a.min[0]) && (b.min[0] < a.max[0]) ) meetingAxies++;
    if ( (b.min[1] > a.min[1]) && (b.min[1] < a.max[1]) ) meetingAxies++;
    if ( (b.min[2] > a.min[2]) && (b.min[2] < a.max[2]) ) meetingAxies++;

    return meetingAxies == 3;
}


