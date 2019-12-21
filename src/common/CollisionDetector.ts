// Collision Detector
import { vec3, mat4, vec4,quat } from 'gl-matrix';
import Mesh from './mesh';
import TrackScene from '../scenes/Track';
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

let between = function(b:number , n1:number, n2:number) {
    let td = Math.abs(n1-n2);
    let d1 = Math.abs(n1-b);
    let d2 = Math.abs(b-n2);
    return (d1+d2 - td <= Number.EPSILON)
}

export function Collides(a : AABB, b : AABB, mat_a : mat4, mat_b : mat4) : boolean
{
    let meetingAxies = 0; // how many axies are colliding between the AABBs (must be at least 3 to be true)
    
    var pmax = a.max;
    var pmin = a.min;
    var omax = b.max;
    var omin = b.min;
    var pmax4 = vec4.fromValues(pmax[0],pmax[1],pmax[2],1);
    var pmin4 = vec4.fromValues(pmin[0],pmin[1],pmin[2],1);
    var omax4 = vec4.fromValues(omax[0],omax[1],omax[2],1);
    var omin4 = vec4.fromValues(omin[0],omin[1],omin[2],1);
    var mto = mat4.transpose(mat4.create(),mat_b);
    omax4 = matbyvec(mto,omax4);
    omin4 = matbyvec(mto,omin4);
    /*
    console.log("=========================player=============================");
    console.log("pmin", pmin4[0],pmin4[1],pmin4[2])
    console.log("pmax", pmax4[0],pmax4[1],pmax4[2])
    console.log("=========================obstac=============================");
    console.log("omin", omin4[0],omin4[1],omin4[2])
    console.log("omax", omax4[0],omax4[1],omax4[2])
    */
    /*
    let amin = vec4.fromValues(a.min[0], a.min[1], a.min[2],1);
    let amax = vec4.fromValues(a.max[0], a.max[1], a.max[2],1);
    let bmin = vec4.fromValues(b.min[0], b.min[1], b.min[2],1);
    let bmax = vec4.fromValues(b.max[0], b.max[1], b.max[2],1);
    amin = matbyvec(mat4.transpose(mat4.create(),mat_a), amin);
    amax = matbyvec(mat4.transpose(mat4.create(),mat_a), amax);
    bmin = matbyvec(mat4.transpose(mat4.create(),mat_b), bmin);
    bmax = matbyvec(mat4.transpose(mat4.create(),mat_b), bmax);
    if ( (bmin[0] > amin[0]) && (bmin[0] < amax[0]) ) meetingAxies++;
    if ( (bmin[1] > amin[1]) && (bmin[1] < amax[1]) ) meetingAxies++;
    if ( (bmin[2] > amin[2]) && (bmin[2] < amax[2]) ) meetingAxies++;*/

    if( between(pmin4[0],omin4[0],omax4[0])  || between(pmax4[0],omin4[0],omax4[0]) )
    meetingAxies++;
    if( between(pmin4[1],omin4[1],omax4[1])  || between(pmax4[1],omin4[1],omax4[1]) )
    meetingAxies++;
    if( between(pmin4[2],omin4[2],omax4[2])  || between(pmax4[2],omin4[2],omax4[2]) )
    meetingAxies++;
    /*
    if( (pmin4[0] >= omin4[0] && pmin4[0] <= omax4[0]) || (pmax4[0] >= omin4[0] && pmax4[0] <= omax4[0]) )
  
    if( (pmin4[1] >= omin4[1] && pmin4[1] <= omax4[1]) || (pmax4[1] >= omin4[1] && pmax4[1] <= omax4[1]) )
    
    if( (pmin4[2] >= omin4[2] && pmin4[2] <= omax4[2]) || (pmax4[2] >= omin4[2] && pmax4[2] <= omax4[2]))
    console.log("z in");*/

    return meetingAxies == 3;
}

