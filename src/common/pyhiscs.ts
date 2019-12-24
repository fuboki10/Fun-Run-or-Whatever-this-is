// Collision Detector
import { vec3, mat4, vec4,quat,vec2 } from 'gl-matrix';
import Mesh from './mesh';
import TrackScene from '../scenes/Track';
import { Vec3 } from 'webgl-obj-loader';
export class physics{
pos:vec3;
velocity:vec3;
accelration:vec3;
wave:boolean;
timedilation:number;
constructor(postion:vec3,speed:vec3,iswave:boolean,acc:vec3){
    this.pos=vec3.clone(postion);
    this.velocity = vec3.clone(speed);
    this.accelration = vec3.clone(acc);
    this.timedilation = 0.0001;
    this.wave = iswave;
    console.log(this.pos);
    console.log(this.velocity);
}
 public move(deltatime:number,max:vec2,min:vec2) {
    if(this.wave)
    {
        this.Accelrate();
        // to avoid problems
        this.pos[0]=Math.min(Math.max(min[0], this.pos[0]), max[0]);
        this.pos[1]=Math.min(Math.max(min[1], this.pos[1]), max[1]);
        let deltadist=vec3.create();
        let currspeed=vec3.create();
        if((this.pos[0]>=max[0]||this.pos[1]>=max[1])&&this.velocity[0]>0){
            vec3.multiply(this.velocity, this.velocity, [-1, -1, -1]);

        }
        if((this.pos[0]<=min[0]||this.pos[1]<=min[1])&&this.velocity[0]<0){
            vec3.multiply(this.velocity, this.velocity, [-1, -1, -1]); 
         }
        vec3.multiply(deltadist,this.velocity,[deltatime,deltatime,deltatime]);
        vec3.add(this.pos,deltadist,this.pos);
    }
    else {
        let deltadist=vec3.create();
        vec3.multiply(deltadist,this.velocity,[deltatime,deltatime,deltatime]);
        vec3.add(this.pos,deltadist,this.pos);
    }
    }
    /**
     * Accelrate
     */
    public Accelrate() {
        vec3.add(this.velocity, this.velocity, this.accelration);
    }
}