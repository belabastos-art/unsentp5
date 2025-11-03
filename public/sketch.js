// UNSENT - P5.js Sketch
// Visual confessions with interactive envelopes

let confessions = [];
let envelopes = [];
let mainEnvelopeImg;
let smallEnvelopeImgs = [];

function preload() {
  // Load main envelope image
  mainEnvelopeImg = loadImage('writing_envelope.jpg');
  
  // Load all small envelope images
  smallEnvelopeImgs = [
    loadImage('envelope_a.png'),
    loadImage('envelope_2a.png'),
    loadImage('envelope_3.jpg'),
    loadImage('envelope_4.jpg'),
    loadImage('envelope_5.jpg'),
    loadImage('envelope_6a.png'),
    loadImage('envelope_7a.png'),
    loadImage('envelope_8a.png'),
    loadImage('envelope_9a.png'),
    loadImage('envelope_10a.png'),
    loadImage('envelope_11a.png')
  ];
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1'); // Behind HTML elements
  
  // Load existing confessions and create envelopes
  loadExistingConfessions();
}

function draw() {
  background('#e6e4dd');
  
  // Draw title
  drawTitle();
  
  // Draw all small envelopes
  for (let env of envelopes) {
    push();
    translate(env.x, env.y);
    rotate(env.rotation);
    
    // Draw envelope image
    imageMode(CENTER);
    image(env.img, 0, 0, env.size, env.size * 0.66);
    
    pop();
  }
  
  // Draw main envelope in center 
  push();
  imageMode(CENTER);
  // Main envelope size: 420 x 300 
  image(mainEnvelopeImg, width/2, height/2, 420, 300);
  pop();
}

function drawTitle() {
  push();
  textFont('Brush Script MT, cursive');
  textSize(90);
  textStyle(NORMAL);
  fill(0);
  stroke(0);
  strokeWeight(1);
  textAlign(LEFT);
  text('Unsent', 50, 100);
}

function addEnvelope(confession) {
  let margin = 120;
  let centerX = width/2;
  let centerY = height/2;
  let minDist = 350; // Keep away from center form
  
  let x, y;
  let attempts = 0;
  
  do {
    x = random(margin, width - margin);
    y = random(margin, height - margin);
    attempts++;
  } while (dist(x, y, centerX, centerY) < minDist && attempts < 50);
  
  let envelope = {
    x: x,
    y: y,
    size: random(70, 110), // Same size range as before
    rotation: random(-PI/8, PI/8),
    confession: confession,
    img: random(smallEnvelopeImgs) // Pick random envelope image
  };
  
  envelopes.push(envelope);
}

function mousePressed() {
  // Check if click is on an envelope
  for (let i = envelopes.length - 1; i >= 0; i--) {
    let env = envelopes[i];
    let d = dist(mouseX, mouseY, env.x, env.y);
    
    if (d < env.size/2) {
      // Show confession
      showConfession(env.confession);
      return;
    }
  }
}

function showConfession(confession) {
  if (confession && confession.msg) {
    let message = confession.msg.trim() === '' ? '(empty confession)' : confession.msg;
    alert(`Anonymous confession:\n\n"${message}"`);
  }
}

async function loadExistingConfessions() {
  try {
    const response = await fetch('/getData');
    const data = await response.json();
    confessions = data.data || [];
    
    console.log(`Loaded ${confessions.length} confessions`);
    
    // Create envelopes for existing confessions
    for (let confession of confessions) {
      if (confession.msg && confession.msg.trim() !== '') {
        addEnvelope(confession);
      }
    }
  } catch (error) {
    console.error('Error loading confessions:', error);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// function to be called from app.js when new confession arrives
window.onNewConfession = function(confession) {
  confessions.push(confession);
  addEnvelope(confession);
  console.log('New envelope added!');
};