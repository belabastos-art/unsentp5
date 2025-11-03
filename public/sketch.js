// UNSENT - P5.js Sketch 

let confessions = [];
let envelopes = [];

// Envelope colors for drawing
const envelopeColors = [
  '#f8c8dc', // Pink
  '#d32f2f', // Red
  '#82b5d9', // Blue
  '#e6a945', // Yellow/Mustard
  '#c9a87c', // Cork/Tan
  '#ffc0cb'  // Light Pink
];

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
    drawEnvelope(0, 0, env.size, env.color, env.hasHeart);
    pop();
  }
  
  // Draw main envelope in center 
  push();
  drawMainEnvelope(width/2, height/2, 420, 300);
  pop();
}

function drawTitle() {
  push();
  // Handwritten cursive font
  textFont('Brush Script MT, cursive');
  textSize(90);
  textStyle(NORMAL);
  fill(0);
  stroke(0);
  strokeWeight(1);
  textAlign(LEFT);
  text('Unsent', 50, 100);
  
  // Add decorative line
  strokeWeight(2);
  line(220, 70, 320, 50);
  pop();
}

function drawEnvelope(x, y, size, color, hasHeart) {
  let w = size;
  let h = size * 0.66;
  
  push();
  rectMode(CENTER);
  
  // Envelope body
  fill(color);
  stroke(0, 50);
  strokeWeight(1);
  rect(x, y, w, h, 3);
  
  // Envelope flap
  fill(red(color) - 20, green(color) - 20, blue(color) - 20);
  triangle(
    x - w/2, y - h/2,
    x + w/2, y - h/2,
    x, y
  );
  
  // Optional heart seal
  if (hasHeart) {
    fill('#d32f2f');
    noStroke();
    let heartSize = size * 0.12;
    drawHeart(x, y, heartSize);
  }
  
  // Fold lines
  stroke(0, 30);
  strokeWeight(0.5);
  line(x - w/2, y - h/2, x, y);
  line(x + w/2, y - h/2, x, y);
  
  pop();
}

function drawMainEnvelope(x, y, w, h) {
  push();
  rectMode(CENTER);
  
  // Main envelope body - cream color
  fill('#e8dcc4');
  stroke(0, 50);
  strokeWeight(2);
  rect(x, y, w, h, 5);
  
  // Envelope flap (open)
  fill('#d4c4a8');
  quad(
    x - w/2, y - h/2,
    x + w/2, y - h/2,
    x + w/3, y - h/2 - 100,
    x - w/3, y - h/2 - 100
  );
  
  fill('#c4b498');
  triangle(
    x - w/2, y - h/2,
    x, y - h/4,
    x - w/2 + 40, y - h/2
  );
  triangle(
    x + w/2, y - h/2,
    x, y - h/4,
    x + w/2 - 40, y - h/2
  );
  
  pop();
}

function drawHeart(x, y, size) {
  push();
  translate(x, y);
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) {
    let r = size * (sin(a) * sqrt(abs(cos(a))) / (sin(a) + 1.4) - 2 * sin(a) + 2);
    let sx = r * cos(a);
    let sy = -r * sin(a);
    vertex(sx, sy);
  }
  endShape(CLOSE);
  pop();
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
    color: random(envelopeColors),
    size: random(70, 110),
    rotation: random(-PI/8, PI/8),
    hasHeart: random() < 0.2, // 20% chance of heart
    confession: confession
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

// Expose function to be called from app.js when new confession arrives
window.onNewConfession = function(confession) {
  confessions.push(confession);
  addEnvelope(confession);
  console.log('New envelope added!');
};
