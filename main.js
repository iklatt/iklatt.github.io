import * as THREE from 'three';
import {OrbitControls} from 'OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xDDCCCC );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight)

const gridHelper = new THREE.GridHelper(200, 50);
scene.add(gridHelper);

//  Comment out so scrolling moves page rather than camera zoom, but use for testing purposes
//const controls = new OrbitControls(camera, renderer.domElement);

function generateCube(side_length, xPos, yPos, zPos, colors){
  const geometry = new THREE.BoxGeometry(side_length, side_length, side_length);
  const box = new THREE.Mesh(geometry, 
    [ new THREE.MeshBasicMaterial({color: colors[0]}),   
    new THREE.MeshBasicMaterial({color: colors[1]}),   
    new THREE.MeshBasicMaterial({color: colors[2]}),   
    new THREE.MeshBasicMaterial({color: colors[3]}),   
    new THREE.MeshBasicMaterial({color: colors[4]}),   
    new THREE.MeshBasicMaterial({color: colors[5]})]
    );
  box.geometry.translate(xPos, yPos, zPos);
  scene.add(box);
  return box;
}

// holds all cubies (box objects) so we can access them elsewhere
const cubieArray = [];

// TODO: 
//    1. Change variable gapSize since its name does not represent what it does.  Instead of changing its name, 
//      change its use to match its name.
//    2. Clean up color selection, i.e. try to use a cleaner and/or smarter solution to determine how to color
//      each side of the cubie 
function generateCubies(sideLength, gapSize){
  let red = 0xB71234;
  let orange = 0xFF5800;
  let white = 0xFFFFFF;
  let yellow = 0xFFD500;
  let green = 0x009B48;
  let blue = 0x0046AD;
  let black = 0x000000;
  // each index of colors corresponds to the following faces of the cubie:
  // [R, L, U, D, F, B]
  const colors = [0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF];
  for(let x = -1; x < 2; x++){
    switch(x){
      case -1:
        colors[0] = black;
        colors[1] = orange;
        break;
      case 0:
        colors[0] = black;
        colors[1] = black;
        break;
      case 1:
        colors[0] = red;
        colors[1] = black;
    }
    for(let y = -1; y < 2; y++){
      switch(y){
        case -1:
          colors[2] = black;
          colors[3] = yellow;
          break;
        case 0:
          colors[2] = black;
          colors[3] = black;
          break;
        case 1:
          colors[2] = white;
          colors[3] = black;
      }
      for(let z = -1; z < 2; z++){
        switch(z){ 
          case -1:
            colors[4] = black;
            colors[5] = blue;
            break;
          case 0:
            colors[4] = black;
            colors[5] = black;
            break;
          case 1:
            colors[4] = green;
            colors[5] = black;
        }
        if(x != 0 || y != 0 || z != 0){
          let cubie = generateCube(sideLength, gapSize * x * sideLength, 
            gapSize * y * sideLength, gapSize * z * sideLength, colors);
          cubieArray.push(cubie);
        }
      }
    }
  }
}

//=========================================================================================
let scrollPercent = 0;

function linearInterpolation(min, max, ratio) {
  return (1 - ratio) * min + ratio * max;
}

function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start)
}

// This is of type [start: int, end: int, void function]
const animationScripts = [];

// For retrieving position of mesh.geometry
function getCenterPoint(mesh) {
  let geometry = mesh.geometry;
  geometry.computeBoundingBox();
  let center = new THREE.Vector3();
  geometry.boundingBox.getCenter( center );
  mesh.localToWorld( center );
  return center;
}

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a[0] && scrollPercent < a[1]) {
            a[2](a[0], a[1]);
        }
    })
}

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
      ((document.documentElement.scrollTop || document.body.scrollTop) /
          ((document.documentElement.scrollHeight ||
              document.body.scrollHeight) -
              document.documentElement.clientHeight)) * 100;
}

// Can probably be cleaned up dramatically
function doMove(moveString){
  let turnDirection = -1;
  let scaler = 1;
  if(moveString.length > 1){
    if(moveString[1] == "'"){
      turnDirection = 1;
    } else if(moveString[1] == "2"){
      scaler = 2;
    } else {
      console.log("Problem with doMove.  Section: moveString[1]");
    }
  }
  let xAngle = 0;
  let yAngle = 0;
  let zAngle = 0;
  let posOrNeg = 0;
  switch(moveString[0]){
    case 'R':
      xAngle = Math.PI / 2;
      posOrNeg = 1;
      break;
    case 'L':
      xAngle = -Math.PI / 2;
      posOrNeg = -1;
      break;
    case 'U':
      yAngle = Math.PI / 2;
      posOrNeg = 1;
      break;
    case 'D':
      yAngle = -Math.PI / 2;
      posOrNeg = -1;
      break;
    case 'F':
      zAngle = Math.PI / 2;
      posOrNeg = 1;
      break;
    case 'B':
      zAngle = -Math.PI / 2;
      posOrNeg = -1;
  }
  for (let index = 0; index < cubieArray.length; index++) {
    if(xAngle != 0 && posOrNeg * getCenterPoint(cubieArray[index]).x > 1){
      let vec = new THREE.Vector3(turnDirection, 0, 0)
      cubieArray[index].rotateOnWorldAxis(vec, scaler * xAngle);
    } else if(yAngle != 0 && posOrNeg * getCenterPoint(cubieArray[index]).y > 1){
      let vec = new THREE.Vector3(0, turnDirection, 0)
      cubieArray[index].rotateOnWorldAxis(vec, scaler * yAngle);
    } else if(zAngle != 0 && posOrNeg * getCenterPoint(cubieArray[index]).z > 1){
      let vec = new THREE.Vector3(0, 0, turnDirection)
      cubieArray[index].rotateOnWorldAxis(vec, scaler * zAngle);
    }
  }
}

//=====================================================================
function invertMoves(invertedScrambleArray){
  const output = invertedScrambleArray.slice();
  output.reverse();
  for(let i = 0; i < output.length; i++){
    if(output[i].length > 1){
      if(output[i][1] == "'"){
        output[i] = output[i][0];
      }
      // if output[i][1] == "2" then we do nothing since it is the inverse of itself
    } else {
      output[i] += "'";
    }
  }
  return output;
}

let scrambleArray = [];

// TODO:
//    Create/use a random scramble generator instead of using the same scramble every time
function initializeScramble(){
  let scramble = "B' L' B2 D2 B2 L' B2 L B2 R F2 R' B R' U' L D L R2";
  scrambleArray = scramble.split(" ");
}

let invertedScrambleArray = [];
let sectionLengthInPercentage = 100;

function initialize(){
  generateCubies(2.5, 1.1);
  initializeScramble();
  invertedScrambleArray = invertMoves(scrambleArray); 
  let numberOfSections = invertedScrambleArray.length + 1; 
  sectionLengthInPercentage = 100 / numberOfSections; 
}

initialize();

let previousSection = scrambleArray.length;

function doMovesOnScroll(){
  let currentSection = Math.floor(scrollPercent / sectionLengthInPercentage); 
  if(previousSection != currentSection){ 
	  if(previousSection < currentSection){
        if(previousSection < invertedScrambleArray.length){
          doMove(invertedScrambleArray[previousSection]); 
	  previousSection++;
        } 
	  } else {
        if(previousSection <= scrambleArray.length && previousSection > 0){
          doMove(scrambleArray[scrambleArray.length - previousSection]); 
	  previousSection--;
        }
    }
  }
}


console.log("Changed initial value of previousSection");

//=========================================================================================
// Animation Loop
function animate(){
  requestAnimationFrame(animate);
  doMovesOnScroll();
  renderer.render(scene, camera);
}

window.scrollTo({ top: 0, behavior: 'smooth' })

animate();
