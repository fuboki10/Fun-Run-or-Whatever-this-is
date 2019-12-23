// Collision Detector
import { vec3, mat4, vec4,quat, vec2 } from 'gl-matrix';
import Mesh from './mesh';
import TrackScene from '../scenes/Track';
import { distance } from 'gl-matrix/src/gl-matrix/vec2';
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
export function SphereCollides(r : number ,c : vec3, a : AABB, b : AABB, mat_a : mat4, mat_b : mat4) : boolean
{
    
    var omax = b.max;
    var omin = b.min;
    var omax4 = vec4.fromValues(omax[0],omax[1],omax[2],1);
    var omin4 = vec4.fromValues(omin[0],omin[1],omin[2],1);
    var mto = mat4.transpose(mat4.create(),mat_b);
    omax4 = matbyvec(mto,omax4);
    omin4 = matbyvec(mto,omin4);
   for(let i =0 ; i < 3 ; i++)
    {
        if (omax4[i] <= omin4[i])
        {
            let tmp = omax4[i];
            omax4[i] = omin4[i];
            omin4[i] = tmp;
        }
    }
    //console.log(omax4[2],omin4[2]);

    let x  = c[0] ;
    let y  = c[1] ;
    let z  = c[2] ;

    if( x < omin4[0])
        x = omin4[0];
    else if (x > omax4[0])
        x = omax4[0]

    if( y < omin4[1])
        y = omin4[1];
    else if (y > omax4[1])
        y = omax4[1]

    if( z < omin4[2])
        z = omin4[2];
    else if (z > omax4[2])
        z = omax4[2]

    if( r >= vec3.distance(c,vec3.fromValues(x,y,z)))
    return true;
 
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
 
    if( between(pmin4[0],omin4[0],omax4[0]) || between(pmax4[0],omin4[0],omax4[0]) || between(omin4[0],pmin4[0],pmax4[0]) || between(omax4[0],pmin4[0],pmax4[0]) )
    meetingAxies++;
    if( between(pmin4[1],omin4[1],omax4[1]) || between(pmax4[1],omin4[1],omax4[1]) || between(omin4[1],pmin4[1],pmax4[1]) || between(omax4[1],pmin4[1],pmax4[1]) )
    meetingAxies++;
    if( between(pmin4[2],omin4[2],omax4[2]) || between(pmax4[2],omin4[2],omax4[2]) || between(omin4[2],pmin4[2],pmax4[2]) || between(omax4[2],pmin4[2],pmax4[2]))
    meetingAxies++;

    return meetingAxies == 3;
}

