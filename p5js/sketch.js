// ===== POSTER ANIMATION - THREE PHASE SYSTEM =====
// Phase 1: Rectangle around Times/Language - grows, text scales, reverses, disappears
// Phase 2: Tangent dots appear on 2026 (points with straight edges)
// Phase 3: Gradual fill to 60% on all elements

const BASE_W = 1080;
const BASE_H = 1350;
const BG_HEX = "#D9DDE6";

// ===== Assets =====
let numbersImg, topSVG, addrSVG, botLSVG, timesImg, langImg, rectangleSVG;

// ===== Element positions (BASE coords) =====
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

// ===== TIMELINE (seconds) =====
const TIMELINE = {
  // Phase 1: Rectangle animation
  phase1Start: 1.0,
  rectForm: 0.5,        // rectangle fades in
  rectGrow: 1.0,        // rectangle expands
  textGrow: 0.8,        // text scales up
  holdExpanded: 0.5,    // pause at max
  textShrink: 0.8,      // text scales back
  rectShrink: 1.0,      // rectangle shrinks back
  rectFade: 0.5,        // rectangle fades out

  // Phase 2: Tangent dots on 2026
  phase2Start: 6.5,     // after phase 1 completes
  tangentAppear: 0.3,   // tangent dots pop in

  // Phase 3: Gradual fill
  phase3Start: 7.0,
  gradualFill: 4.0,     // time to reach 60% fill

  // End
  holdFinal: 3.0
};

// ===== DOT SETTINGS =====
const DOT_STYLE = {
  fill: [255, 255, 255],
  stroke: [0, 149, 255],
  strokeWeight: 0.8
};

const RECT_DOT_SPACING = 12;  // spacing for rectangle border dots
const RECT_DOT_RADIUS = 3;
const RECT_PADDING = 15;      // padding around Times/Language
const RECT_GROW_SCALE = 1.4;  // how much rectangle grows (1.4 = 40% bigger)
const TEXT_GROW_SCALE = 1.25; // how much text grows (smaller than rectangle)

const TANGENT_THRESHOLD = 0.15;  // how "straight" an edge must be (lower = more points)
const TANGENT_DOT_RADIUS = 4;

const FILL_TARGET = 0.6;  // 60% fill
const FILL_DOT_RADIUS = 3;

// Edge detection thresholds
const EDGE_THRESHOLDS = {
  numbers2026: { solid: 200, empty: 180 },
  times:       { solid: 128, empty: 100 },
  language:    { solid: 128, empty: 100 },
  address:     { solid: 128, empty: 100 },
  topBlock:    { solid: 128, empty: 100 },
  bottomLeft:  { solid: 128, empty: 100 }
};

// ===== INTERNALS =====
let cnv;
let maskSoft, coverLayer, glowLayer, posterLayer;

// Phase 1: Rectangle SVG
let rectOpacity = 0;
let rectScale = 1;
let rectBounds = { x: 0, y: 0, w: 0, h: 0 };
let rectCenter = { x: 0, y: 0 };
let textScale = 1;

// Phase 2: Tangent dots (points with straight edges)
let tangentDots = [];

// Phase 3: Fill dots (sampled at 60%)
let fillDots = {
  numbers2026: [],
  times: [],
  language: [],
  address: [],
  topBlock: [],
  bottomLeft: []
};

// All edge points (100%) for sampling
let allEdges = {
  numbers2026: [],
  times: [],
  language: [],
  address: [],
  topBlock: [],
  bottomLeft: []
};

let systemReady = false;

function preload() {
  numbersImg = loadImage("2026.png");
  topSVG     = loadImage("topBlock.svg");
  addrSVG    = loadImage("addressBlock.svg");
  botLSVG    = loadImage("bottomLeft.svg");
  timesImg   = loadImage("Times.png");
  langImg    = loadImage("Language.png");
  rectangleSVG = loadImage("rectangle.svg");
}

function setup() {
  cnv = createCanvas(BASE_W, BASE_H);
  pixelDensity(1);
  smooth();
  fitCanvasToWindow();

  // Build layers
  maskSoft = buildSoftAlphaMask(numbersImg);
  coverLayer = makeCoverLayer(maskSoft, COVER_ALPHA);
  glowLayer = makeGlowLayer(maskSoft);

  // Pre-render poster
  posterLayer = createGraphics(BASE_W, BASE_H);
  posterLayer.pixelDensity(1);
  renderPosterTo(posterLayer);

  // Initialize all systems
  initPhase1();
  initPhase2();
  initPhase3();
  
  systemReady = true;
  console.log("✅ Animation system ready");
}

// ===== PHASE 1: RECTANGLE INITIALIZATION =====

function initPhase1() {
  console.log("Initializing Phase 1: Rectangle SVG animation");

  // Calculate tight bounds around Times + Language
  const timesRect = items.times;
  const langRect = items.lang;

  rectBounds = {
    x: Math.min(timesRect.x, langRect.x) - RECT_PADDING,
    y: timesRect.y - RECT_PADDING,
    w: Math.max(timesRect.x + timesRect.w, langRect.x + langRect.w) - Math.min(timesRect.x, langRect.x) + RECT_PADDING * 2,
    h: (langRect.y + langRect.h) - timesRect.y + RECT_PADDING * 2
  };

  // Calculate center for scaling
  rectCenter = {
    x: rectBounds.x + rectBounds.w / 2,
    y: rectBounds.y + rectBounds.h / 2
  };

  console.log(`  Rectangle bounds: ${Math.round(rectBounds.w)} x ${Math.round(rectBounds.h)}`);
}

// ===== PHASE 2: TANGENT DOTS INITIALIZATION =====

function initPhase2() {
  console.log("Initializing Phase 2: Tangent dots on 2026");
  
  // Get edges of 2026
  const numbersG = createGraphics(BASE_W, BASE_H);
  numbersG.pixelDensity(1);
  numbersG.clear();
  numbersG.image(numbersImg, 0, 0, BASE_W, BASE_H);
  
  const edges = traceEdgesFromGraphics(numbersG, EDGE_THRESHOLDS.numbers2026);
  
  // Find tangent points (where edge direction is mostly horizontal or vertical)
  tangentDots = findTangentPoints(edges, TANGENT_THRESHOLD, TANGENT_DOT_RADIUS);
  console.log(`  Tangent dots: ${tangentDots.length}`);
}

function findTangentPoints(edges, threshold, radius) {
  const tangentPoints = [];
  
  // Create a spatial map for quick neighbor lookup
  const edgeSet = new Set(edges.map(e => `${e.x},${e.y}`));
  
  // Sample edges and check local direction
  const spacing = 8;  // check every N pixels
  const checked = new Set();
  
  for (const edge of edges) {
    const key = `${Math.floor(edge.x / spacing)},${Math.floor(edge.y / spacing)}`;
    if (checked.has(key)) continue;
    checked.add(key);
    
    // Look at neighbors to determine edge direction
    const neighbors = [];
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (edgeSet.has(`${edge.x + dx},${edge.y + dy}`)) {
          neighbors.push({ dx, dy });
        }
      }
    }
    
    if (neighbors.length < 2) continue;
    
    // Calculate average direction
    let avgDx = 0, avgDy = 0;
    for (const n of neighbors) {
      avgDx += n.dx;
      avgDy += n.dy;
    }
    avgDx /= neighbors.length;
    avgDy /= neighbors.length;
    
    // Normalize
    const len = Math.sqrt(avgDx * avgDx + avgDy * avgDy);
    if (len < 0.1) continue;
    avgDx /= len;
    avgDy /= len;
    
    // Check if mostly horizontal or vertical (tangent is perpendicular)
    const isHorizontal = Math.abs(avgDy) < threshold;
    const isVertical = Math.abs(avgDx) < threshold;
    
    if (isHorizontal || isVertical) {
      tangentPoints.push({
        x: edge.x,
        y: edge.y,
        r: radius,
        opacity: 0
      });
    }
  }
  
  return tangentPoints;
}

// ===== PHASE 3: GRADUAL FILL INITIALIZATION =====

function initPhase3() {
  console.log("Initializing Phase 3: Gradual fill to 60%");
  
  // Trace all edges
  traceAllEdges();
  
  // Sample 60% of edges for each element
  for (const elementName of Object.keys(allEdges)) {
    const edges = allEdges[elementName];
    const targetCount = Math.floor(edges.length * FILL_TARGET);
    
    // Randomly sample edges
    const shuffled = [...edges].sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, targetCount);
    
    // Create dots with staggered appearance times
    sampled.forEach((edge, i) => {
      fillDots[elementName].push({
        x: edge.x,
        y: edge.y,
        r: FILL_DOT_RADIUS,
        opacity: 0,
        delay: i / sampled.length  // 0 to 1, used for staggered appearance
      });
    });
    
    console.log(`  ${elementName}: ${fillDots[elementName].length} fill dots (${Math.round(FILL_TARGET * 100)}% of ${edges.length})`);
  }
}

function traceAllEdges() {
  // Numbers 2026
  const numbersG = createGraphics(BASE_W, BASE_H);
  numbersG.pixelDensity(1);
  numbersG.clear();
  numbersG.image(numbersImg, 0, 0, BASE_W, BASE_H);
  allEdges.numbers2026 = sampleEdges(traceEdgesFromGraphics(numbersG, EDGE_THRESHOLDS.numbers2026), 4);
  
  // Times
  const timesG = renderElementToGraphics(timesImg, items.times);
  allEdges.times = sampleEdges(traceEdgesFromGraphics(timesG, EDGE_THRESHOLDS.times), 3);
  
  // Language
  const langG = renderElementToGraphics(langImg, items.lang);
  allEdges.language = sampleEdges(traceEdgesFromGraphics(langG, EDGE_THRESHOLDS.language), 3);
  
  // Address
  const addrG = renderElementToGraphics(addrSVG, items.addr);
  allEdges.address = sampleEdges(traceEdgesFromGraphics(addrG, EDGE_THRESHOLDS.address), 3);
  
  // Top block
  const topG = renderElementToGraphics(topSVG, items.top);
  allEdges.topBlock = sampleEdges(traceEdgesFromGraphics(topG, EDGE_THRESHOLDS.topBlock), 3);
  
  // Bottom left
  const botG = renderElementToGraphics(botLSVG, items.botL);
  allEdges.bottomLeft = sampleEdges(traceEdgesFromGraphics(botG, EDGE_THRESHOLDS.bottomLeft), 3);
}

function sampleEdges(edges, spacing) {
  const sampled = [];
  const grid = new Set();
  
  for (const p of edges) {
    const cellX = Math.floor(p.x / spacing);
    const cellY = Math.floor(p.y / spacing);
    const key = `${cellX},${cellY}`;
    
    if (!grid.has(key)) {
      grid.add(key);
      sampled.push(p);
    }
  }
  
  return sampled;
}

// ===== MAIN DRAW LOOP =====

function draw() {
  if (!systemReady) return;
  
  const t = millis() / 1000;
  
  // Update all phases
  updatePhase1(t);
  updatePhase2(t);
  updatePhase3(t);
  
  // Render
  renderScene(t);
}

// ===== PHASE 1 UPDATE =====

function updatePhase1(t) {
  const p1 = TIMELINE.phase1Start;
  const formEnd = p1 + TIMELINE.rectForm;
  const growEnd = formEnd + TIMELINE.rectGrow;
  const textGrowEnd = growEnd + TIMELINE.textGrow;
  const holdEnd = textGrowEnd + TIMELINE.holdExpanded;
  const textShrinkEnd = holdEnd + TIMELINE.textShrink;
  const rectShrinkEnd = textShrinkEnd + TIMELINE.rectShrink;
  const fadeEnd = rectShrinkEnd + TIMELINE.rectFade;

  // Before phase 1
  if (t < p1) {
    rectOpacity = 0;
    rectScale = 1;
    textScale = 1;
    return;
  }

  // Rectangle forming (fade in)
  if (t < formEnd) {
    const progress = (t - p1) / TIMELINE.rectForm;
    rectOpacity = easeOutCubic(progress);
    rectScale = 1;
    textScale = 1;
    return;
  }

  // Rectangle growing
  if (t < growEnd) {
    const progress = easeInOutCubic((t - formEnd) / TIMELINE.rectGrow);
    rectOpacity = 1;
    rectScale = 1 + (RECT_GROW_SCALE - 1) * progress;
    textScale = 1;
    return;
  }

  // Text growing
  if (t < textGrowEnd) {
    const progress = easeInOutCubic((t - growEnd) / TIMELINE.textGrow);
    rectOpacity = 1;
    rectScale = RECT_GROW_SCALE;
    textScale = 1 + (TEXT_GROW_SCALE - 1) * progress;
    return;
  }

  // Hold expanded
  if (t < holdEnd) {
    rectOpacity = 1;
    rectScale = RECT_GROW_SCALE;
    textScale = TEXT_GROW_SCALE;
    return;
  }

  // Text shrinking
  if (t < textShrinkEnd) {
    const progress = easeInOutCubic((t - holdEnd) / TIMELINE.textShrink);
    rectOpacity = 1;
    rectScale = RECT_GROW_SCALE;
    textScale = TEXT_GROW_SCALE - (TEXT_GROW_SCALE - 1) * progress;
    return;
  }

  // Rectangle shrinking
  if (t < rectShrinkEnd) {
    const progress = easeInOutCubic((t - textShrinkEnd) / TIMELINE.rectShrink);
    rectOpacity = 1;
    rectScale = RECT_GROW_SCALE - (RECT_GROW_SCALE - 1) * progress;
    textScale = 1;
    return;
  }

  // Fading out
  if (t < fadeEnd) {
    const progress = (t - rectShrinkEnd) / TIMELINE.rectFade;
    rectOpacity = 1 - easeInOutCubic(progress);
    rectScale = 1;
    textScale = 1;
    return;
  }

  // After phase 1
  rectOpacity = 0;
  rectScale = 1;
  textScale = 1;
}

// ===== PHASE 2 UPDATE =====

function updatePhase2(t) {
  const p2 = TIMELINE.phase2Start;
  const appearEnd = p2 + TIMELINE.tangentAppear;
  
  if (t < p2) {
    tangentDots.forEach(d => d.opacity = 0);
    return;
  }
  
  if (t < appearEnd) {
    const progress = easeOutCubic((t - p2) / TIMELINE.tangentAppear);
    tangentDots.forEach(d => d.opacity = progress);
    return;
  }
  
  tangentDots.forEach(d => d.opacity = 1);
}

// ===== PHASE 3 UPDATE =====

function updatePhase3(t) {
  const p3 = TIMELINE.phase3Start;
  const fillEnd = p3 + TIMELINE.gradualFill;
  
  if (t < p3) {
    for (const elementName of Object.keys(fillDots)) {
      fillDots[elementName].forEach(d => d.opacity = 0);
    }
    return;
  }
  
  const overallProgress = Math.min(1, (t - p3) / TIMELINE.gradualFill);
  
  for (const elementName of Object.keys(fillDots)) {
    fillDots[elementName].forEach(d => {
      // Each dot appears based on its delay
      const dotProgress = Math.max(0, (overallProgress - d.delay * 0.7) / 0.3);
      d.opacity = easeOutCubic(Math.min(1, dotProgress));
    });
  }
}

// ===== RENDER =====

function renderScene(t) {
  drawingContext.globalCompositeOperation = "source-over";
  drawingContext.filter = "none";
  
  // Draw base poster
  image(posterLayer, 0, 0);

  // Always draw Times/Language dynamically with current scale
  const cx = (items.times.x + items.lang.x + items.lang.w) / 2;
  const cy = items.times.y + ((items.lang.y + items.lang.h) - items.times.y) / 2;

  push();
  translate(cx, cy);
  scale(textScale);
  translate(-cx, -cy);
  image(timesImg, items.times.x, items.times.y, items.times.w, items.times.h);
  image(langImg, items.lang.x, items.lang.y, items.lang.w, items.lang.h);
  pop();

  // Draw Phase 1 rectangle SVG
  if (rectOpacity > 0) {
    push();
    tint(255, rectOpacity * 255);
    translate(rectCenter.x, rectCenter.y);
    scale(rectScale);
    translate(-rectCenter.x, -rectCenter.y);
    image(rectangleSVG, rectBounds.x, rectBounds.y, rectBounds.w, rectBounds.h);
    pop();
  }
  
  // Draw Phase 2 tangent dots
  drawDots(tangentDots);
  
  // Draw Phase 3 fill dots
  for (const elementName of Object.keys(fillDots)) {
    drawDots(fillDots[elementName]);
  }
}

function drawDots(dots) {
  for (const dot of dots) {
    if (dot.opacity <= 0) continue;
    
    push();
    fill(DOT_STYLE.fill[0], DOT_STYLE.fill[1], DOT_STYLE.fill[2], dot.opacity * 255);
    stroke(DOT_STYLE.stroke[0], DOT_STYLE.stroke[1], DOT_STYLE.stroke[2], dot.opacity * 255);
    strokeWeight(DOT_STYLE.strokeWeight);
    circle(dot.x, dot.y, dot.r * 2);
    pop();
  }
}

// ===== EDGE TRACING =====

function renderElementToGraphics(img, item) {
  const g = createGraphics(BASE_W, BASE_H);
  g.pixelDensity(1);
  g.clear();
  g.image(img, item.x, item.y, item.w, item.h);
  return g;
}

function traceEdgesFromGraphics(g, thresholds) {
  const edges = [];
  g.loadPixels();
  
  const w = g.width;
  const h = g.height;
  const pixels = g.pixels;
  const solidThreshold = thresholds.solid || 180;
  const emptyThreshold = thresholds.empty || 150;
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const alpha = pixels[idx + 3];
      
      if (alpha > solidThreshold) {
        const neighbors = [
          ((y - 1) * w + x) * 4,
          ((y + 1) * w + x) * 4,
          (y * w + (x - 1)) * 4,
          (y * w + (x + 1)) * 4,
        ];
        
        let isEdge = false;
        for (const nIdx of neighbors) {
          if (pixels[nIdx + 3] < emptyThreshold) {
            isEdge = true;
            break;
          }
        }
        
        if (isEdge) {
          edges.push({ x, y });
        }
      }
    }
  }
  
  return edges;
}

// ===== POSTER RENDERING =====

function renderPosterTo(g) {
  g.push();
  g.clear();
  g.background(BG_HEX);

  g.push();
  g.tint(255, NUM_BASE_ALPHA);
  g.image(numbersImg, 0, 0, BASE_W, BASE_H);
  g.pop();

  g.push();
  g.tint(255, GLOW_ALPHA);
  g.image(glowLayer, 0, 0, BASE_W, BASE_H);
  g.pop();

  g.image(topSVG, items.top.x, items.top.y, items.top.w, items.top.h);
  g.image(addrSVG, items.addr.x, items.addr.y, items.addr.w, items.addr.h);
  // Don't include Times/Language here - we'll draw them dynamically
  // g.image(timesImg, items.times.x, items.times.y, items.times.w, items.times.h);
  // g.image(langImg, items.lang.x, items.lang.y, items.lang.w, items.lang.h);
  g.image(botLSVG, items.botL.x, items.botL.y, items.botL.w, items.botL.h);

  drawClippedTo(g, coverLayer, 0, CUT.yMin, BASE_W, CUT.yMax - CUT.yMin);

  g.push();
  g.tint(255, OVERLAY_NUM_ALPHA);
  drawClippedTo(g, numbersImg, 0, CUT.yMin, BASE_W, CUT.yMax - CUT.yMin);
  g.pop();

  g.pop();
}

function drawClippedTo(g, img, x, y, w, h) {
  g.drawingContext.save();
  g.drawingContext.beginPath();
  g.drawingContext.rect(x, y, w, h);
  g.drawingContext.clip();
  g.image(img, 0, 0, BASE_W, BASE_H);
  g.drawingContext.restore();
}

// ===== MASK/GLOW HELPERS =====

function buildSoftAlphaMask(srcImg) {
  const m = createImage(srcImg.width, srcImg.height);
  m.loadPixels();
  srcImg.loadPixels();
  for (let i = 0; i < srcImg.pixels.length; i += 4) {
    m.pixels[i + 0] = 255;
    m.pixels[i + 1] = 255;
    m.pixels[i + 2] = 255;
    m.pixels[i + 3] = srcImg.pixels[i + 3];
  }
  m.updatePixels();
  return m;
}

function makeCoverLayer(alphaMask, coverAlpha) {
  const g = createGraphics(BASE_W, BASE_H);
  g.pixelDensity(1);
  g.background(BG_HEX);
  const img = g.get();
  img.mask(alphaMask);
  img.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    img.pixels[i + 3] = Math.min(255, Math.round(img.pixels[i + 3] * (coverAlpha / 255)));
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

// ===== LAYOUT =====

function fitCanvasToWindow() {
  const scale = Math.min(windowWidth / BASE_W, windowHeight / BASE_H);
  const cssW = Math.round(BASE_W * scale);
  const cssH = Math.round(BASE_H * scale);
  cnv.style("width", cssW + "px");
  cnv.style("height", cssH + "px");
  cnv.position((windowWidth - cssW) / 2, (windowHeight - cssH) / 2);
}

function windowResized() {
  fitCanvasToWindow();
}

// ===== UTILS =====

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
