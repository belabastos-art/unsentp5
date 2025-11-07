let confessions = [];
let envelopes = [];
let mainEnvelopeImg;
let smallEnvelopeImgs = [];
let titleImg;

function preload() {
  titleImg = loadImage('title.png');
  mainEnvelopeImg = loadImage('writing_envelope.jpg');
  
  smallEnvelopeImgs = [
    loadImage('envelope_4.jpg'),
    loadImage('envelope_5.jpg'),
    loadImage('envelope_6a.png'),
    loadImage('envelope_8a.png'),
    loadImage('envelope_9a.png')
  ];
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  
  loadExistingConfessions();
}

function draw() {
  background('#e6e4dd');
  
  // Main envelope
  if (mainEnvelopeImg) {
    imageMode(CENTER);
    image(mainEnvelopeImg, width/2, height/2, 1000, 500);
  }
  
  // Title
  if (titleImg) {
    imageMode(CORNER);
    let titleWidth = 400;
    let titleHeight = (titleImg.height / titleImg.width) * titleWidth;
    image(titleImg, 0, 15, titleWidth, titleHeight);
  }
  
  // Small envelopes
  for (let env of envelopes) {
    push();
    translate(env.x, env.y);
    rotate(env.rotation);
    imageMode(CENTER);
    image(env.img, 0, 0, env.size, env.size * 0.66);
    pop();
  }
}

function addEnvelope(confession) {
  let margin = 120;
  let centerX = width/2;
  let centerY = height/2;
  let minDist = 350;
  
  let x, y;
  let attempts = 0;
  
  do {
    x = random(margin, width - margin);
    y = random(margin, height - margin);
    attempts++;
  } while ((dist(x, y, centerX, centerY) < minDist || 
           (x < 500 && y < 280)) && 
           attempts < 50);
  
  let envelope = {
    x: x,
    y: y,
    size: 100,
   rotation: radians(random(-30, 30)),
    confession: confession,
    img: random(smallEnvelopeImgs)
  };
  
  envelopes.push(envelope);
}

function mousePressed() {
  for (let i = envelopes.length - 1; i >= 0; i--) {
    let env = envelopes[i];
    let d = dist(mouseX, mouseY, env.x, env.y);
    
    if (d < env.size/2) {
      let message = env.confession.msg.trim() || '(empty)';
      alert(`Anonymous confession:\n\n"${message}"`);
      return;
    }
  }
}

async function loadExistingConfessions() {
  const response = await fetch('/getData');
  const data = await response.json();
  confessions = data.data || [];
  
  for (let confession of confessions) {
    if (confession.msg && confession.msg.trim()) {
      addEnvelope(confession);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

window.onNewConfession = function(confession) {
  confessions.push(confession);
  addEnvelope(confession);
};

