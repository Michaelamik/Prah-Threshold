let points = [];
let numPoints = 50;

let centerX, centerY;
let baseRadius = 5;
let targetRadius = 5;

// glitch efekt
let glitchIntensity = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  fill(0);

  centerX = width / 2;
  centerY = height / 2;

  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, TWO_PI);
    points.push({ angle: angle, r: baseRadius, vr: 0 });
  }
}

function draw() {
  // podpora pro dotyk: pokud je dotyk, použij touchX/touchY
  let mx = touches.length > 0 ? touches[0].x : mouseX;
  let my = touches.length > 0 ? touches[0].y : mouseY;
  let pmx = touches.length > 0 ? touches[0].x : pmouseX;
  let pmy = touches.length > 0 ? touches[0].y : pmouseY;

  let speed = dist(mx, my, pmx, pmy);
  let d = dist(mx, my, centerX, centerY);

  // ===== aktivace glitch jen při rychlém pohybu =====
  let glitchActive = speed > 30;
  if (glitchActive) glitchIntensity += (speed / 60) * 0.1;
  else glitchIntensity *= 0.9;
  glitchIntensity = constrain(glitchIntensity, 0, 1);

  // ===== barevné pozadí =====
  if (glitchActive) {
    let bg = map(glitchIntensity, 0, 1, 255, 0); // invertace
    background(bg);
  } else {
    background(255); // bílé pozadí při pomalém pohybu
  }

  // ===== RŮST BLOBU =====
  let growth = map(d, 300, 0, 0, 1, true) * map(speed, 0, 60, 0, 1, true);

  // škálování blobu podle velikosti obrazovky
  let screenScale = min(windowWidth, windowHeight) / 1080; 
  let sizeFactor = map(targetRadius, baseRadius, max(width, height), 1, 8, true) * screenScale;
  let speedFactor = map(speed, 0, 60, 0.5, 3, true);

  if (growth > 0.05) targetRadius += growth * sizeFactor * speedFactor;

  let maxSize = max(width, height);
  if (targetRadius > maxSize * 0.5 && speed > 10) {
    targetRadius += pow(speed / 15, 2) * 13;
  }

  targetRadius = constrain(targetRadius, baseRadius, maxSize * screenScale);

  // deformace blobu
  let deformMultiplier;
  if (targetRadius < 40) deformMultiplier = 0.25;
  else if (targetRadius < 150) deformMultiplier = 1.0;
  else deformMultiplier = 3.0;

  let force = map(speed, 0, 60, 0, 200, true) *
              map(d, 300, 0, 0, 1, true) *
              deformMultiplier;

  let speedKick = speed > 12 ? map(speed, 12, 60, 0, 25, true) * deformMultiplier : 0;

  for (let p of points) {
    if (random() < 0.02 && force > 30) p.vr += random(-20, 20) * deformMultiplier;

    let dirToMouse = cos(p.angle) * (mx - centerX) + sin(p.angle) * (my - centerY);
    p.vr += (dirToMouse * 0.0012) * force;
    p.vr += random(-speedKick, speedKick);

    p.vr += (targetRadius - p.r) * 0.03;
    p.vr *= 0.7;
    p.r += p.vr;
  }

  // ===== RGB GLITCH BLOB =====
  if (glitchActive) {
    let offset = glitchIntensity * 10;
    strokeWeight(2);
    stroke(255, 0, 0, glitchIntensity * 100);
    drawBlob(offset, 0);
    stroke(0, 255, 255, glitchIntensity * 100);
    drawBlob(-offset, 0);
  }

  noStroke();
  fill(glitchActive ? map(glitchIntensity, 0, 1, 0, 255) : 0);
  drawBlob(0, 0);
}

// kreslení blobu
function drawBlob(xOffset, yOffset) {
  beginShape();
  for (let p of points) {
    let x = centerX + cos(p.angle) * p.r + xOffset;
    let y = centerY + sin(p.angle) * p.r + yOffset;
    curveVertex(x, y);
  }
  endShape(CLOSE);
}

// reset
function mousePressed() {
  targetRadius = baseRadius;
  for (let p of points) {
    p.r = baseRadius;
    p.vr = 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
}
