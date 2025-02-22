let font;
let points = [];
// Use a single string for user input.
let userInput = "";
const promptText = "Type Anything";  // Updated default prompt
let sampleFactor = 0.1; // Controls point density (lower = more points)
let fontSize = 250;     // Reduced text size
let effectMode = 0;     // Current effect (0 to 8)

// Effect names (0–8)
const effectNames = [
  "Repulsion", 
  "Wavy", 
  "Perlin Noise", 
  "Ripple", 
  "Spiral", 
  "Magnetic Pull", 
  "Distortion Ripple", 
  "Swirl", 
  "Bubble Expansion"
];

// Trail (cursor) configuration
let trails = [];
const trailLifetime = 100;  // 100ms lifetime for extremely short trail
const cursorDiameter = 40;   // Cursor size (diameter)

function preload() {
  // Load your font – ensure "Lagency-Regular.otf" is in your project folder
  font = loadFont("Lagency-Regular.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor(); // Hide default mouse pointer
  textFont(font);
  generatePoints();
}

function generatePoints() {
  // If no text is typed, display the prompt.
  let word = (userInput === "") ? promptText : userInput;
  let bounds = font.textBounds(word, 0, 0, fontSize);
  let x = width / 2 - bounds.w / 2;
  let y = height / 2 + bounds.h / 2;
  points = font.textToPoints(word, x, y, fontSize, { sampleFactor: sampleFactor });
}

function draw() {
  let threshold = window.innerHeight * 0.5;
  
  if (window.scrollY < threshold) {
    background(30);
    let currentTime = millis();
    
    // Draw a short-lived gradient trail at the mouse position.
    trails.push({ x: mouseX, y: mouseY, t: currentTime });
    trails = trails.filter(trail => currentTime - trail.t <= trailLifetime);
    for (let trail of trails) {
      let age = (currentTime - trail.t) / trailLifetime;
      let alphaFactor = 1 - age;
      drawGradient(trail.x, trail.y, cursorDiameter, alphaFactor);
    }
    
    // Draw interactive text effects.
    noStroke();
    // Use darker fill for the prompt.
    fill(userInput === "" ? 100 : 255);
    let t = millis() / 1000;
    let cx = width / 2;
    let cy = height / 2;
    
    for (let i = 0; i < points.length; i++) {
      let pt = points[i];
      let x = pt.x;
      let y = pt.y;
      let offsetX = 0;
      let offsetY = 0;
      let d, factor, angle, swirlAngle;
      
      switch (effectMode) {
        case 0:
          // Repulsion: push points away from the mouse.
          d = dist(x, y, mouseX, mouseY);
          if (d < 100) {
            factor = map(d, 0, 100, 50, 0);
            angle = atan2(y - mouseY, x - mouseX);
            offsetX = cos(angle) * factor;
            offsetY = sin(angle) * factor;
          }
          break;
        case 1:
          // Wavy: sine-wave motion.
          offsetX = map(mouseX, 0, width, -20, 20);
          offsetY = map(mouseY, 0, height, -20, 20);
          let wave = sin(t * 2 + x * 0.05 + y * 0.05) * 10;
          offsetX += wave;
          offsetY += wave;
          break;
        case 2:
          // Perlin Noise: morph with noise-based offset.
          let noiseFactor = noise(x * 0.01 + t, y * 0.01 + t);
          offsetX = map(noiseFactor, 0, 1, -mouseX * 0.05, mouseX * 0.05);
          offsetY = map(noiseFactor, 0, 1, -mouseY * 0.05, mouseY * 0.05);
          break;
        case 3:
          // Ripple: radial ripple distortion.
          d = dist(x, y, mouseX, mouseY);
          let ripple = sin(t * 10 - d * 0.1) * 10;
          angle = atan2(y - mouseY, x - mouseX);
          offsetX = cos(angle) * ripple;
          offsetY = sin(angle) * ripple;
          break;
        case 4:
          // Spiral: twist around canvas center.
          let spiralStrength = map(mouseY, 0, height, -0.1, 0.1);
          let angleOffset = spiralStrength * dist(x, y, cx, cy);
          let dx = x - cx;
          let dy = y - cy;
          let spiralX = dx * cos(angleOffset) - dy * sin(angleOffset);
          let spiralY = dx * sin(angleOffset) + dy * cos(angleOffset);
          x = cx + spiralX;
          y = cy + spiralY;
          break;
        case 5:
          // Magnetic Pull: draw points toward the mouse.
          d = dist(x, y, mouseX, mouseY);
          if (d < 150) {
            factor = map(d, 0, 150, 0.8, 0);
            offsetX = (mouseX - x) * factor;
            offsetY = (mouseY - y) * factor;
          }
          break;
        case 6:
          // Distortion Ripple: radial sine ripple warps text.
          d = dist(x, y, mouseX, mouseY);
          factor = sin(d / 15 - t * 5) * map(d, 0, 200, 15, 0);
          angle = atan2(y - mouseY, x - mouseX);
          offsetX = cos(angle) * factor;
          offsetY = sin(angle) * factor;
          break;
        case 7:
          // Swirl: points swirl around the mouse.
          d = dist(x, y, mouseX, mouseY);
          if (d < 200) {
            swirlAngle = map(d, 0, 200, PI / 2, 0);
            angle = atan2(y - mouseY, x - mouseX) + swirlAngle;
            offsetX = cos(angle) * d - (x - mouseX);
            offsetY = sin(angle) * d - (y - mouseY);
          }
          break;
        case 8:
          // Bubble Expansion: push points outward.
          d = dist(x, y, mouseX, mouseY);
          if (d < 150) {
            factor = map(d, 0, 150, 30, 0);
            angle = atan2(y - mouseY, x - mouseX);
            offsetX = cos(angle) * factor;
            offsetY = sin(angle) * factor;
          }
          break;
      }
      
      ellipse(x + offsetX, y + offsetY, 3, 3);
    }
    
    // Display instructions overlay with an extra line spacing.
    fill(200);
    textSize(16);
    textAlign(LEFT, TOP);
    text(
      "Effect: " + effectNames[effectMode] +
      "\nPress ENTER to change effect" +
      "\n\nUp/Down arrows adjust density" +
      "\nType (max 10 letters) / BACKSPACE to delete",
      10, 10
    );
    
    // Draw a small custom cursor (white circle).
    fill(255);
    noStroke();
    ellipse(mouseX, mouseY, 10, 10);
    
  } else {
    // Bottom half: Plain white background.
    background(255);
  }
}

// Utility: Draws a radial gradient circle at (cx,cy) with diameter d.
function drawGradient(cx, cy, d, alphaFactor = 1) {
  let r = d / 2;
  for (let i = r; i > 0; i--) {
    let inter = map(i, 0, r, 0, 1);
    let c1 = color(200, 150, 255, 200 * alphaFactor);
    let c2 = color(50, 100, 255, 0);
    let col = lerpColor(c1, c2, inter);
    noStroke();
    fill(col);
    ellipse(cx, cy, i * 2, i * 2);
  }
}

// Handle alphanumeric character input.
function keyTyped() {
  if (window.scrollY < window.innerHeight * 0.5) {
    if (userInput.length < 10 && key.length === 1) {
      userInput += key;
      generatePoints();
    }
  }
}

// Handle special keys: ENTER to change effect, BACKSPACE to delete.
function keyPressed() {
  if (window.scrollY < window.innerHeight * 0.5) {
    if (keyCode === ENTER) {
      effectMode = (effectMode + 1) % effectNames.length;
    } else if (keyCode === BACKSPACE) {
      userInput = userInput.substring(0, userInput.length - 1);
      generatePoints();
      return false;
    } else if (keyCode === UP_ARROW) {
      sampleFactor = constrain(sampleFactor - 0.01, 0.05, 0.2);
      generatePoints();
    } else if (keyCode === DOWN_ARROW) {
      sampleFactor = constrain(sampleFactor + 0.01, 0.05, 0.2);
      generatePoints();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePoints();
}
