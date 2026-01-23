// ===== POSTER ANIMATION - THREE PHASE SYSTEM =====
// Phase 1: Rectangle around Times/Language - grows, text scales, reverses, disappears
// Phase 2: Tangent dots appear on 2026 (points with straight edges)
// Phase 3: Gradual fill to 60% on all elements

const BASE_W = 1080;
const BASE_H = 1350;
const BG_HEX = "#D9DDE6";

// ===== Assets =====
let numbersImg, topSVG, addrSVG, botLSVG, timesImg, langImg, rectangleLinesSVG;

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
  phase1Start: 1.7,
  rectForm: 0.85,       // rectangle fades in
  rectGrow: 1.7,        // rectangle expands
  textGrow: 1.4,        // text scales up
  holdExpanded: 0.85,   // pause at max
  textShrink: 1.4,      // text scales back
  rectShrink: 1.7,      // rectangle shrinks back
  rectGrowToPoster: 2.5, // rectangle grows to fill poster
  rectFade: 0.85,       // rectangle fades out

  // Phase 2: Tangent dots on 2026
  phase2Start: 12.9,    // after phase 1 completes (1.7 + 0.85 + 1.7 + 1.4 + 0.85 + 1.4 + 1.7 + 2.5 + 0.85)
  tangentAppear: 0.5,   // tangent dots pop in

  // Phase 3: Gradual fill
  phase3Start: 13.4,    // 12.9 + 0.5
  gradualFill: 6.8,     // time to reach 60% fill

  // Phase 4: Dots grow
  phase4Start: 20.2,    // 13.4 + 6.8
  dotsGrow: 3.4,        // dots grow to final size

  // Phase 5: Brownian motion and blob formation
  phase5Start: 23.6,    // 20.2 + 3.4
  textFadeOut: 1.0,     // fade out original text
  blobForm: 10.0,       // dots slowly move to blob positions

  // End
  holdFinal: 5.0
};

// ===== DOT SETTINGS =====
const DOT_STYLE = {
  fill: [255, 255, 255],
  stroke: [0, 149, 255],
  strokeWeight: 0.8
};

const RECT_DOT_SPACING = 12;  // spacing for rectangle border dots
const RECT_DOT_RADIUS = 3;
const RECT_PADDING = 30;      // padding around Times/Language (increased to avoid dot overlap)
const RECT_GROW_SCALE = 1.2;  // how much rectangle grows (reduced to avoid going off-screen)
const TEXT_GROW_SCALE = 1.15; // how much text grows (smaller than rectangle)
const RECT_POSTER_MARGIN = 20; // margin from poster edges when rectangle grows to poster size

const TANGENT_THRESHOLD = 0.15;  // how "straight" an edge must be (lower = more points)
const TANGENT_DOT_RADIUS = 4;

const FILL_TARGET = 0.6;  // 60% fill
const FILL_DOT_RADIUS = 3;

// Phase 4: Dot growth
const DOT_GROW_2026 = 8;  // 2026 dots grow 8x
const DOT_GROW_OTHER = 4;  // Other dots grow 4x

// Phase 5: Brownian motion
const BLOB_COUNT = 5;  // Number of blobs for 2026 dots
const BLOB_ATTRACTION = 0.04;  // How strongly dots are pulled to blobs (slower)
const BROWNIAN_FORCE = 0.2;  // Random force strength for 2026 dots
const DAMPING = 0.93;  // Velocity damping (friction)
const OTHER_DOT_DRIFT = 0.25;  // Gentle Brownian motion for other dots

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
let rectScaleX = 1;
let rectScaleY = 1;
let rectBounds = { x: 0, y: 0, w: 0, h: 0 };
let rectInitialBounds = { x: 0, y: 0, w: 0, h: 0 };  // Store initial bounds
let rectCurrentBounds = { x: 0, y: 0, w: 0, h: 0 };  // Current animated bounds
let rectCenter = { x: 0, y: 0 };
let textScale = 1;
let cornerDots = [];  // Corner dots that stay circular
let cornerHandles = [];  // Corner handles (small rectangles)
let rectFadeOutEnabled = false;  // Set to true to fade out rectangle at end

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

// Phase 4: Dot scaling
let dotScale2026 = 1;  // Scale for 2026 dots
let dotScaleOther = 1;  // Scale for other dots

// Phase 5: Brownian motion and poster opacity
let posterOpacity = 1;  // Opacity of original poster elements
let blobCenters = [];  // Positions of the 5 blobs for 2026 dots

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
  rectangleLinesSVG = loadImage("rectangle-lines.svg");
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
  initPhase5();

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

  // Store initial bounds for animation
  rectInitialBounds = { ...rectBounds };
  rectCurrentBounds = { ...rectBounds };

  // Calculate center for scaling
  rectCenter = {
    x: rectBounds.x + rectBounds.w / 2,
    y: rectBounds.y + rectBounds.h / 2
  };

  // Initialize corner dots (positioned at rectangle corners, will be updated during animation)
  // Each dot has outer circle (r=5.5) and inner circle (r=2.44)
  const dotOuterRadius = 5.5;
  const dotInnerRadius = 2.44;
  const dotOffset = 17.5;  // offset from corner

  cornerDots = [
    { corner: 'topLeft', outerR: dotOuterRadius, innerR: dotInnerRadius, offset: dotOffset },
    { corner: 'topRight', outerR: dotOuterRadius, innerR: dotInnerRadius, offset: dotOffset },
    { corner: 'bottomLeft', outerR: dotOuterRadius, innerR: dotInnerRadius, offset: dotOffset },
    { corner: 'bottomRight', outerR: dotOuterRadius, innerR: dotInnerRadius, offset: dotOffset }
  ];

  // Initialize corner handles (small rectangles at corners)
  const handleW = 10;
  const handleH = 11.089;

  cornerHandles = [
    { corner: 'topLeft', w: handleW, h: handleH },
    { corner: 'topRight', w: handleW, h: handleH },
    { corner: 'bottomLeft', w: handleW, h: handleH },
    { corner: 'bottomRight', w: handleW, h: handleH }
  ];

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

// ===== PHASE 5: BROWNIAN MOTION INITIALIZATION =====

function initPhase5() {
  console.log("Initializing Phase 5: Brownian motion and blob formation");

  // Create 5 blob centers spread across the entire canvas in a pattern
  // This ensures they're well-distributed and far apart
  blobCenters = [
    { x: BASE_W * 0.15, y: BASE_H * 0.15 },  // Top left
    { x: BASE_W * 0.85, y: BASE_H * 0.2 },   // Top right
    { x: BASE_W * 0.5, y: BASE_H * 0.5 },    // Center
    { x: BASE_W * 0.2, y: BASE_H * 0.8 },    // Bottom left
    { x: BASE_W * 0.8, y: BASE_H * 0.85 }    // Bottom right
  ];

  // Add some randomness to avoid perfect grid
  blobCenters.forEach(blob => {
    blob.x += random(-BASE_W * 0.1, BASE_W * 0.1);
    blob.y += random(-BASE_H * 0.1, BASE_H * 0.1);
    blob.x = constrain(blob.x, BASE_W * 0.05, BASE_W * 0.95);
    blob.y = constrain(blob.y, BASE_H * 0.05, BASE_H * 0.95);
  });

  // Add physics properties to tangent dots
  tangentDots.forEach(dot => {
    dot.vx = 0;
    dot.vy = 0;
    dot.targetBlob = floor(random(BLOB_COUNT));  // Assign to random blob
  });

  // Add physics properties to fill dots
  for (const elementName of Object.keys(fillDots)) {
    fillDots[elementName].forEach(dot => {
      dot.vx = 0;
      dot.vy = 0;
      if (elementName === 'numbers2026') {
        dot.targetBlob = floor(random(BLOB_COUNT));  // Assign to random blob
      }
    });
  }

  console.log(`  Created ${BLOB_COUNT} blob centers for 2026 dots`);
}

// ===== MAIN DRAW LOOP =====

function draw() {
  if (!systemReady) return;

  const t = millis() / 1000;

  // Update all phases
  updatePhase1(t);
  updatePhase2(t);
  updatePhase3(t);
  updatePhase4(t);
  updatePhase5(t);

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
  const growToPosterEnd = rectShrinkEnd + TIMELINE.rectGrowToPoster;
  const fadeEnd = growToPosterEnd + TIMELINE.rectFade;

  // Target bounds: poster edges with margin
  const targetBounds = {
    x: RECT_POSTER_MARGIN,
    y: RECT_POSTER_MARGIN,
    w: BASE_W - RECT_POSTER_MARGIN * 2,
    h: BASE_H - RECT_POSTER_MARGIN * 2
  };

  // Before phase 1
  if (t < p1) {
    rectOpacity = 0;
    rectScaleX = 1;
    rectScaleY = 1;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1;
    return;
  }

  // Rectangle forming (fade in)
  if (t < formEnd) {
    const progress = (t - p1) / TIMELINE.rectForm;
    rectOpacity = easeOutCubic(progress);
    rectScaleX = 1;
    rectScaleY = 1;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1;
    return;
  }

  // Rectangle growing (uniform scaling from center)
  if (t < growEnd) {
    const progress = easeInOutCubic((t - formEnd) / TIMELINE.rectGrow);
    const scale = 1 + (RECT_GROW_SCALE - 1) * progress;
    rectOpacity = 1;
    rectScaleX = scale;
    rectScaleY = scale;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1;
    return;
  }

  // Text growing
  if (t < textGrowEnd) {
    const progress = easeInOutCubic((t - growEnd) / TIMELINE.textGrow);
    rectOpacity = 1;
    rectScaleX = RECT_GROW_SCALE;
    rectScaleY = RECT_GROW_SCALE;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1 + (TEXT_GROW_SCALE - 1) * progress;
    return;
  }

  // Hold expanded
  if (t < holdEnd) {
    rectOpacity = 1;
    rectScaleX = RECT_GROW_SCALE;
    rectScaleY = RECT_GROW_SCALE;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = TEXT_GROW_SCALE;
    return;
  }

  // Text shrinking
  if (t < textShrinkEnd) {
    const progress = easeInOutCubic((t - holdEnd) / TIMELINE.textShrink);
    rectOpacity = 1;
    rectScaleX = RECT_GROW_SCALE;
    rectScaleY = RECT_GROW_SCALE;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = TEXT_GROW_SCALE - (TEXT_GROW_SCALE - 1) * progress;
    return;
  }

  // Rectangle shrinking (back to uniform 1.0)
  if (t < rectShrinkEnd) {
    const progress = easeInOutCubic((t - textShrinkEnd) / TIMELINE.rectShrink);
    const scale = RECT_GROW_SCALE - (RECT_GROW_SCALE - 1) * progress;
    rectOpacity = 1;
    rectScaleX = scale;
    rectScaleY = scale;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1;
    return;
  }

  // Rectangle growing to poster edges (interpolate bounds directly)
  if (t < growToPosterEnd) {
    const progress = easeInOutCubic((t - rectShrinkEnd) / TIMELINE.rectGrowToPoster);
    rectOpacity = 1;
    rectScaleX = 1;  // No scaling, we'll use bounds directly
    rectScaleY = 1;

    // Interpolate bounds from initial to target (poster edges)
    rectCurrentBounds = {
      x: rectInitialBounds.x + (targetBounds.x - rectInitialBounds.x) * progress,
      y: rectInitialBounds.y + (targetBounds.y - rectInitialBounds.y) * progress,
      w: rectInitialBounds.w + (targetBounds.w - rectInitialBounds.w) * progress,
      h: rectInitialBounds.h + (targetBounds.h - rectInitialBounds.h) * progress
    };
    textScale = 1;
    return;
  }

  // Fading out (if enabled)
  if (rectFadeOutEnabled && t < fadeEnd) {
    const progress = (t - growToPosterEnd) / TIMELINE.rectFade;
    rectOpacity = 1 - easeInOutCubic(progress);
    rectScaleX = 1;
    rectScaleY = 1;
    rectCurrentBounds = { ...targetBounds };
    textScale = 1;
    return;
  }

  // After fade or holding at poster size
  if (rectFadeOutEnabled) {
    rectOpacity = 0;
  } else {
    rectOpacity = 1;
  }
  rectScaleX = 1;
  rectScaleY = 1;
  rectCurrentBounds = { ...targetBounds };
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

// ===== PHASE 4 UPDATE =====

function updatePhase4(t) {
  const p4 = TIMELINE.phase4Start;
  const growEnd = p4 + TIMELINE.dotsGrow;

  // Before phase 4
  if (t < p4) {
    dotScale2026 = 1;
    dotScaleOther = 1;
    return;
  }

  // Dots growing
  if (t < growEnd) {
    const progress = easeInOutCubic((t - p4) / TIMELINE.dotsGrow);
    dotScale2026 = 1 + (DOT_GROW_2026 - 1) * progress;
    dotScaleOther = 1 + (DOT_GROW_OTHER - 1) * progress;
    return;
  }

  // After phase 4 - hold at max size
  dotScale2026 = DOT_GROW_2026;
  dotScaleOther = DOT_GROW_OTHER;
}

// ===== PHASE 5 UPDATE =====

function updatePhase5(t) {
  const p5 = TIMELINE.phase5Start;
  const fadeEnd = p5 + TIMELINE.textFadeOut;
  const blobEnd = fadeEnd + TIMELINE.blobForm;

  // Before phase 5
  if (t < p5) {
    posterOpacity = 1;
    return;
  }

  // Fade out original text
  if (t < fadeEnd) {
    const progress = (t - p5) / TIMELINE.textFadeOut;
    posterOpacity = 1 - easeInOutCubic(progress);
  } else {
    posterOpacity = 0;
  }

  // Apply Brownian motion and blob formation
  if (t >= p5) {
    const motionProgress = t >= fadeEnd ?
      Math.min(1, (t - fadeEnd) / TIMELINE.blobForm) : 0;

    // Update tangent dots (2026 dots - move to blobs)
    tangentDots.forEach(dot => {
      updateDotPhysics2026(dot, motionProgress);
    });

    // Update fill dots
    for (const elementName of Object.keys(fillDots)) {
      fillDots[elementName].forEach(dot => {
        if (elementName === 'numbers2026') {
          updateDotPhysics2026(dot, motionProgress);
        } else {
          updateDotPhysicsOther(dot);
        }
      });
    }
  }
}

function updateDotPhysics2026(dot, blobProgress) {
  // Get target blob center
  const blob = blobCenters[dot.targetBlob];

  // Calculate direction to blob
  const dx = blob.x - dot.x;
  const dy = blob.y - dot.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Apply attraction force toward blob (increases over time)
  if (dist > 1) {
    const attraction = BLOB_ATTRACTION * blobProgress;
    dot.vx += (dx / dist) * attraction;
    dot.vy += (dy / dist) * attraction;
  }

  // Add Brownian motion (random force)
  dot.vx += (random() - 0.5) * BROWNIAN_FORCE;
  dot.vy += (random() - 0.5) * BROWNIAN_FORCE;

  // Apply damping (friction)
  dot.vx *= DAMPING;
  dot.vy *= DAMPING;

  // Update position
  dot.x += dot.vx;
  dot.y += dot.vy;

  // Bounce off edges (more natural than hard constraining)
  if (dot.x < 0 || dot.x > BASE_W) {
    dot.vx *= -0.5;
    dot.x = constrain(dot.x, 0, BASE_W);
  }
  if (dot.y < 0 || dot.y > BASE_H) {
    dot.vy *= -0.5;
    dot.y = constrain(dot.y, 0, BASE_H);
  }
}

function updateDotPhysicsOther(dot) {
  // Stronger Brownian motion for other dots - free floating
  dot.vx += (random() - 0.5) * OTHER_DOT_DRIFT;
  dot.vy += (random() - 0.5) * OTHER_DOT_DRIFT;

  // Apply damping (lighter damping for more freedom)
  dot.vx *= 0.98;
  dot.vy *= 0.98;

  // Update position
  dot.x += dot.vx;
  dot.y += dot.vy;

  // Bounce off edges instead of constraining (more natural Brownian motion)
  if (dot.x < 0 || dot.x > BASE_W) {
    dot.vx *= -0.8;
    dot.x = constrain(dot.x, 0, BASE_W);
  }
  if (dot.y < 0 || dot.y > BASE_H) {
    dot.vy *= -0.8;
    dot.y = constrain(dot.y, 0, BASE_H);
  }
}

// ===== RENDER =====

function renderScene(t) {
  drawingContext.globalCompositeOperation = "source-over";
  drawingContext.filter = "none";

  // Draw base poster (empty background)
  image(posterLayer, 0, 0);

  // Draw all poster elements dynamically with posterOpacity
  if (posterOpacity > 0) {
    push();
    tint(255, posterOpacity * 255);

    // Draw 2026 with glow
    push();
    tint(255, NUM_BASE_ALPHA * posterOpacity);
    image(numbersImg, 0, 0, BASE_W, BASE_H);
    pop();

    push();
    tint(255, GLOW_ALPHA * posterOpacity);
    image(glowLayer, 0, 0, BASE_W, BASE_H);
    pop();

    // Draw other elements
    image(topSVG, items.top.x, items.top.y, items.top.w, items.top.h);
    image(addrSVG, items.addr.x, items.addr.y, items.addr.w, items.addr.h);
    image(botLSVG, items.botL.x, items.botL.y, items.botL.w, items.botL.h);

    pop();

    // Draw clipped sections (using drawingContext clip directly)
    push();
    tint(255, posterOpacity * 255);
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(0, CUT.yMin, BASE_W, CUT.yMax - CUT.yMin);
    drawingContext.clip();

    tint(255, posterOpacity * 255);
    image(coverLayer, 0, 0, BASE_W, BASE_H);

    tint(255, OVERLAY_NUM_ALPHA * posterOpacity);
    image(numbersImg, 0, 0, BASE_W, BASE_H);

    drawingContext.restore();
    pop();
  }

  // Draw Times/Language dynamically with current scale
  if (posterOpacity > 0) {
    const cx = (items.times.x + items.lang.x + items.lang.w) / 2;
    const cy = items.times.y + ((items.lang.y + items.lang.h) - items.times.y) / 2;

    push();
    tint(255, posterOpacity * 255);
    translate(cx, cy);
    scale(textScale);
    translate(-cx, -cy);
    image(timesImg, items.times.x, items.times.y, items.times.w, items.times.h);
    image(langImg, items.lang.x, items.lang.y, items.lang.w, items.lang.h);
    pop();
  }

  // Draw Phase 1 rectangle
  if (rectOpacity > 0) {
    // Calculate actual rectangle position and size
    let drawX, drawY, drawW, drawH;

    if (rectScaleX !== 1 || rectScaleY !== 1) {
      // Uniform scaling phase - scale from center
      const scaledW = rectBounds.w * rectScaleX;
      const scaledH = rectBounds.h * rectScaleY;
      drawX = rectCenter.x - scaledW / 2;
      drawY = rectCenter.y - scaledH / 2;
      drawW = scaledW;
      drawH = scaledH;
    } else {
      // Direct bounds animation (poster-fit phase)
      drawX = rectCurrentBounds.x;
      drawY = rectCurrentBounds.y;
      drawW = rectCurrentBounds.w;
      drawH = rectCurrentBounds.h;
    }

    // Draw rectangle with consistent stroke
    push();
    noFill();
    stroke(58, 141, 237, rectOpacity * 255); // #3A8DED
    strokeWeight(1);
    rect(drawX, drawY, drawW, drawH);
    pop();

    // Draw corner dots and handles (always circular)
    drawCornerElements(rectOpacity, drawX, drawY, drawW, drawH);
  }
  
  // Draw Phase 2 tangent dots (on 2026, so use 2026 scale, with stroke)
  drawDots(tangentDots, dotScale2026, DOT_GROW_2026, true);

  // Draw Phase 3 fill dots (numbers2026 use 2026 scale, others use other scale)
  for (const elementName of Object.keys(fillDots)) {
    if (elementName === 'numbers2026') {
      drawDots(fillDots[elementName], dotScale2026, DOT_GROW_2026, true);
    } else {
      // Other dots lose stroke in Phase 5 (posterOpacity == 0)
      const showStroke = posterOpacity > 0;
      drawDots(fillDots[elementName], dotScaleOther, DOT_GROW_OTHER, showStroke);
    }
  }
}

function drawCornerElements(opacity, x, y, w, h) {
  // Calculate corners based on actual drawn rectangle
  const corners = {
    topLeft: { x: x, y: y },
    topRight: { x: x + w, y: y },
    bottomLeft: { x: x, y: y + h },
    bottomRight: { x: x + w, y: y + h }
  };

  const blueColor = [58, 141, 237]; // #3A8DED

  // Draw corner handles (small rectangles)
  push();
  fill(blueColor[0], blueColor[1], blueColor[2], opacity * 255);
  noStroke();
  for (const handle of cornerHandles) {
    const corner = corners[handle.corner];
    if (handle.corner === 'topLeft') {
      rect(corner.x, corner.y, handle.w, handle.h);
    } else if (handle.corner === 'topRight') {
      rect(corner.x - handle.w, corner.y, handle.w, handle.h);
    } else if (handle.corner === 'bottomLeft') {
      rect(corner.x, corner.y - handle.h, handle.w, handle.h);
    } else if (handle.corner === 'bottomRight') {
      rect(corner.x - handle.w, corner.y - handle.h, handle.w, handle.h);
    }
  }
  pop();

  // Draw corner dots (always circular)
  for (const dot of cornerDots) {
    const corner = corners[dot.corner];
    let dotX = corner.x;
    let dotY = corner.y;

    // Offset dots from corner
    if (dot.corner === 'topLeft') {
      dotX += dot.offset;
      dotY += dot.offset;
    } else if (dot.corner === 'topRight') {
      dotX -= dot.offset;
      dotY += dot.offset;
    } else if (dot.corner === 'bottomLeft') {
      dotX += dot.offset;
      dotY -= dot.offset;
    } else if (dot.corner === 'bottomRight') {
      dotX -= dot.offset;
      dotY -= dot.offset;
    }

    push();
    // Outer circle (stroke only)
    noFill();
    stroke(blueColor[0], blueColor[1], blueColor[2], opacity * 255);
    strokeWeight(1);
    circle(dotX, dotY, dot.outerR * 2);

    // Inner circle (filled)
    fill(blueColor[0], blueColor[1], blueColor[2], opacity * 255);
    noStroke();
    circle(dotX, dotY, dot.innerR * 2);
    pop();
  }
}

function drawDots(dots, scale = 1, maxScale = 1, showStroke = true) {
  for (const dot of dots) {
    if (dot.opacity <= 0) continue;

    push();
    fill(DOT_STYLE.fill[0], DOT_STYLE.fill[1], DOT_STYLE.fill[2], dot.opacity * 255);

    if (showStroke) {
      stroke(DOT_STYLE.stroke[0], DOT_STYLE.stroke[1], DOT_STYLE.stroke[2], dot.opacity * 255);
      // Scale stroke weight: goes from 1x to 2x as dots reach their max scale
      const progress = maxScale > 1 ? (scale - 1) / (maxScale - 1) : 0;
      const strokeScale = 1 + progress;  // 1x to 2x
      strokeWeight(DOT_STYLE.strokeWeight * strokeScale);
    } else {
      noStroke();
    }

    circle(dot.x, dot.y, dot.r * 2 * scale);
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
  // Just background - all content will be drawn dynamically
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
