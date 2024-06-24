import { Collider } from './collider.js';
import { MovingCollider } from './moving-collider.js'

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const floorShapes = [];
let shapes = [];
const size = 10;

let resizeTimeout;

//#region Canvas and floor
function handleResize() {
  if (resizeTimeout)
    clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(drawCanvas, 300);
}

function drawCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  clearCanvas({
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  })

  drawFloor();
}

function clearCanvas({ x, y, width, height }) {
  context.clearRect(x, y, width, height);
}

function drawFloor() {
  const floor = new Collider({
    x: 0,
    y: canvas.height - size,
    width: canvas.width,
    height: size,
    color: '#0095DD'
  });

  draw(floor);
  floorShapes.push(floor);
}

function draw(collider) {
  context.fillStyle = collider.color;
  context.fillRect(collider.x, collider.y, collider.width, collider.height);
}

drawCanvas();
//#endregion

const forces = {
  gravity: 1,
}

function createShape(mouseEvent) {
  const shape = new MovingCollider({
    x: mouseEvent.x - size / 2, // Centrar horizontalmente
    y: mouseEvent.y - size / 2, // Centrar verticalmente
    width: size,
    height: size,
    mass: 1,
  });

  loop(shape);
}

function loop(shape) {
  const ended = createShapes(shape);
  if (ended) {
    // La forma pasa a ser parte del piso y ser considerada para la colisión
    floorShapes.push(shape);

    // Limpiar rastro de formas anteriores
    shapes.splice(0, shapes.length)
    return;
  }

  updateShapeData(shape);

  requestAnimationFrame(function() {
    loop(shape);
  });
}

function createShapes(shape) {  
  let height = getMaxHeight(shape);

  const ended = shape.y > height;  
  if (ended)
    shape.y = height;
  
  shapes.push(shape);

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawShapes();

  return ended;
}

function updateShapeData(shape) {
  const forceX = 0;
  const forceY = shape.mass * forces.gravity;
  const accelerationX = forceX / shape.mass;
  const accelerationY = forceY / shape.mass;

  shape.velX += accelerationX;
  shape.velY += accelerationY;
  shape.x += shape.velX;
  shape.y += shape.velY;
}

function getMaxHeight(shape) {
  if (shape.collide === undefined) {
    const otherShape = detectCollide(shape);    
    shape.collide = otherShape;
    return otherShape.y - otherShape.height;
  }

  return shape.collide.y - shape.collide.height;
}

function detectCollide(shape) {
  const shapeCollide = floorShapes.findLast(s =>  
    (s.x === 0 // El piso tiene x = 0
    || 
    Math.abs(shape.x - s.x) < shape.width) 
    &&
    s.y > shape.y
  )
   
  return shapeCollide;
}

function drawShapes() {
  floorShapes.forEach(floor => {
    draw(floor);
  })

  shapes.forEach(shape => {
    draw(shape);
  })
}

window.onresize = handleResize;
// window.onclick = (e) => createShape(e)
window.onmousemove = (e) => {
  if (e.buttons !== 1)
    return;
  
  createShape(e)
}

window.ontouchmove = (e) => {
  if (e.buttons !== 1)
    return;
  
  createShape(e)
}