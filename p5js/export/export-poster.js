// ===== POSTER EXPORT UTILITY =====
// Run this once to export the base poster as a PNG
// Press 'S' to save, or it auto-saves after loading

const BASE_W = 1080;
const BASE_H = 1350;
const BG_HEX = "#D9DDE6";

let numbersImg, topSVG, addrSVG, botLSVG, timesImg, langImg;
let allLoaded = false;
let saved = false;

const items = {
  top:   { x: 440.46, y:  98.68, w: 534.19, h: 208.81 },
  addr:  { x: 131.05, y: 353.93, w: 607.86, h:  86.84 },
  botL:  { x: 130.26, y:1156.06, w: 833.34, h: 102.25 },
  times: { x: 132.63, y: 683.17, w: 320.80, h:  85.63 },
  lang:  { x: 130.79, y: 795.01, w: 516.03, h: 102.70 }
};

const CUT = { yMin: 255, yMax: 565 };
const NUM_BASE_ALPHA = 70;
const OVERLAY_NUM_ALPHA = 55;
const COVER_ALPHA = 300;
const GLOW_ALPHA = 66;
const GLOW_BLUR_PX = 35;

let maskSoft, coverLayer, glowLayer;

function preload() {
  numbersImg = loadImage("assets/images/2026.png");
  topSVG     = loadImage("assets/svg/top-block.svg");
  addrSVG    = loadImage("assets/svg/address-block.svg");
  botLSVG    = loadImage("assets/svg/bottom-left.svg");
  timesImg   = loadImage("assets/images/Times.png");
  langImg    = loadImage("assets/images/Language.png");
}

function setup() {
  createCanvas(BASE_W, BASE_H);
  pixelDensity(1);
  
  // Build layers
  maskSoft = buildSoftAlphaMask(numbersImg);
  coverLayer = makeCoverLayer(maskSoft, COVER_ALPHA);
  glowLayer = makeGlowLayer(maskSoft);
  
  allLoaded = true;
  console.log("Ready! Press 'S' to save poster, or wait 1 second for auto-save.");
}

function draw() {
  if (!allLoaded) return;
  
  // Render the poster
  background(BG_HEX);
  
  // Numbers base (faded)
  push();
  tint(255, NUM_BASE_ALPHA);
  image(numbersImg, 0, 0, BASE_W, BASE_H);
  pop();
  
  // Glow
  push();
  tint(255, GLOW_ALPHA);
  image(glowLayer, 0, 0, BASE_W, BASE_H);
  pop();
  
  // Foreground elements
  image(topSVG, items.top.x, items.top.y, items.top.w, items.top.h);
  image(addrSVG, items.addr.x, items.addr.y, items.addr.w, items.addr.h);
  image(timesImg, items.times.x, items.times.y, items.times.w, items.times.h);
  image(langImg, items.lang.x, items.lang.y, items.lang.w, items.lang.h);
  image(botLSVG, items.botL.x, items.botL.y, items.botL.w, items.botL.h);
  
  // Cover layer in CUT zone
  drawClipped(coverLayer, 0, CUT.yMin, BASE_W, CUT.yMax - CUT.yMin);
  
  // Overlay number in CUT zone
  push();
  tint(255, OVERLAY_NUM_ALPHA);
  drawClipped(numbersImg, 0, CUT.yMin, BASE_W, CUT.yMax - CUT.yMin);
  pop();
  
  // Auto-save after 1 second
  if (!saved && millis() > 1000) {
    saveCanvas('poster-frame1', 'png');
    saved = true;
    console.log("✅ Saved poster-frame1.png");
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('poster-frame1', 'png');
    console.log("✅ Saved poster-frame1.png");
  }
  
  // Also export individual elements for edge tracing
  if (key === 'e' || key === 'E') {
    exportElements();
  }
}

function exportElements() {
  console.log("Exporting individual elements...");
  
  // Export each element separately for edge detection
  
  // 1. Numbers only
  let g = createGraphics(BASE_W, BASE_H);
  g.clear();
  g.image(numbersImg, 0, 0, BASE_W, BASE_H);
  g.save('element-2026.png');
  
  // 2. Times only
  g = createGraphics(BASE_W, BASE_H);
  g.clear();
  g.image(timesImg, items.times.x, items.times.y, items.times.w, items.times.h);
  g.save('element-times.png');
  
  // 3. Language only
  g = createGraphics(BASE_W, BASE_H);
  g.clear();
  g.image(langImg, items.lang.x, items.lang.y, items.lang.w, items.lang.h);
  g.save('element-language.png');
  
  // 4. Address only
  g = createGraphics(BASE_W, BASE_H);
  g.clear();
  g.image(addrSVG, items.addr.x, items.addr.y, items.addr.w, items.addr.h);
  g.save('element-address.png');
  
  // 5. Top block only
  g = createGraphics(BASE_W, BASE_H);
  g.clear();
  g.image(topSVG, items.top.x, items.top.y, items.top.w, items.top.h);
  g.save('element-top.png');
  
  // 6. Bottom left only
  g = createGraphics(BASE_W, BASE_H);
  g.clear();
  g.image(botLSVG, items.botL.x, items.botL.y, items.botL.w, items.botL.h);
  g.save('element-bottom.png');
  
  console.log("✅ Exported all elements!");
}

// ===== Helper functions =====

function drawClipped(img, x, y, w, h) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, h);
  drawingContext.clip();
  image(img, 0, 0, BASE_W, BASE_H);
  drawingContext.restore();
}

function buildSoftAlphaMask(srcImg) {
  const m = createImage(srcImg.width, srcImg.height);
  m.loadPixels();
  srcImg.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    const a = srcImg.pixels[i + 3];
    m.pixels[i + 0] = 255;
    m.pixels[i + 1] = 255;
    m.pixels[i + 2] = 255;
    m.pixels[i + 3] = a;
  }
  m.updatePixels();
  return m;
}

function makeCoverLayer(alphaMask, coverAlpha) {
  const g = createGraphics(BASE_W, BASE_H);
  g.pixelDensity(1);
  g.clear();
  g.background(BG_HEX);
  const img = g.get();
  img.mask(alphaMask);
  img.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    const a = img.pixels[i + 3];
    img.pixels[i + 3] = Math.min(255, Math.round(a * (coverAlpha / 255)));
  }
  img.updatePixels();
  return img;
}

function makeGlowLayer(alphaMask) {
  const g = createGraphics(BASE_W, BASE_H);
  g.pixelDensity(1);
  g.background(255);
  const img = g.get();
  img.mask(alphaMask);
  const gg = createGraphics(BASE_W, BASE_H);
  gg.pixelDensity(1);
  gg.drawingContext.filter = `blur(${GLOW_BLUR_PX}px)`;
  gg.image(img, 0, 0, BASE_W, BASE_H);
  return gg.get();
}
