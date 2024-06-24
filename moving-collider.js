import { Collider } from "./collider.js";

export class MovingCollider extends Collider {
  constructor({ velX = 0, velY = 0, mass = 1, collide = undefined, ...params}) {
    super(params);
    
    this.velX = velX;
    this.velY = velY;
    this.mass = mass;
    this.collide = collide;
  }
}