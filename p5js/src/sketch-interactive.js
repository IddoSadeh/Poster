// ===== POSTER ANIMATION - INTERACTIVE VERSION =====
// Phase 1: Rectangle around Times/Language - grows, text scales, reverses, disappears
// Phase 2: Tangent dots appear on 2026 (points with straight edges)
// Phase 3: Gradual fill to 60% on all elements

// ===== INTERACTIVE CONTROLS =====
let isPaused = false;
let manualTime = 0;  // Manual time control (in seconds)
let lastFrameTime = 0;
let startTime = 0;

// Get parameter from control panel
function getParam(id, defaultValue) {
  const elem = document.getElementById(id);
  return elem ? parseFloat(elem.value) : defaultValue;
}

// Update parameter in real-time (called every frame)
function updateParameters() {
  // Phase 1
  TIMELINE.breathInhale = getParam('breathe-inhale', 4.5);
  TIMELINE.breathHold = getParam('breathe-hold', 3.0);
  TIMELINE.breathExhale = getParam('breathe-exhale', 4.5);
  TIMELINE.releaseGrow = getParam('release-grow', 7.0);
  TIMELINE.ghostFade = getParam('ghost-fade', 4.0);
  TIMELINE.tangentAppear = getParam('tangent-appear', 12.0);
  TIMELINE.gradualFill = getParam('gradual-fill', 30.0);
  TIMELINE.dotsGrow = getParam('dots-grow', 18.0);
  TIMELINE.blueTransformStart = getParam('blue-transform-start', 8.0);
  TIMELINE.blueTransformDuration = getParam('blue-transform-duration', 12.0);
  TIMELINE.textEmergeStart = getParam('text-emerge-start', 8.0);
  TIMELINE.textEmergeDuration = getParam('text-emerge-duration', 8.0);
}

const BASE_W = 1080;
const BASE_H = 1350;
const BG_HEX = "#D9DDE6";

// ===== Assets =====
let numbersImg, topSVG, addrSVG, botLSVG, timesImg, langImg, rectangleLinesSVG;
let textData;  // Figma text data
let ibmPlexFont;  // IBM Plex Mono font

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

// ===== TIMELINE (seconds) - Now dynamic, updated from controls =====
let TIMELINE = {
  // Phase 1: The Breath - A breathing graphic design poster
  phase1Start: 2.5,
  rectForm: 2.5,        // The setup: rectangle fades in (slower)
  breathInhale: 4.5,    // The breath (inhale): unified expansion of rectangle + text
  breathHold: 3.0,      // The breath (hold): pause at peak inflation
  breathExhale: 4.5,    // The breath (exhale): unified contraction back to origin
  releaseGrow: 7.0,     // The release: slow growth to poster edges, locking into place
  ghostFade: 4.0,       // The ghosting: rectangle fades, corner dots remain as anchors

  // Phase 2: The Constellation - Stars flickering on a horizon
  phase2Start: 28.0,    // The shift: 2026 begins to be analyzed
  tangentAppear: 12.0,  // Dots twinkle into existence - slower, more mesmerizing

  // Phase 3: The Infusion - A slow, creeping density
  phase3Start: 40.0,    // The accumulation begins
  gradualFill: 30.0,    // Slow sprinkle, like rain on pavement - even slower

  // Phase 4: The Bloom - Synchronized expansion
  phase4Start: 70.0,    // The expansion: data points inflate
  dotsGrowStartDelay: 1.0,  // Wait for all dots to fully appear before growing
  dotsGrow: 18.0,       // Synchronized bloom - all dots grow together

  // Phase 5: Smooth transformations (no popping)
  phase5Start: 89.0,            // Start floating and transforming
  floatStart: 0.0,              // Brownian motion starts immediately
  blueTransformStart: 0.0,      // Small dots turn blue immediately (at Phase 5 start)
  blueTransformDuration: 0.5,   // Nearly instant transformation (before dispersion explosion)
  strokeFadeStart: 12.0,        // Strokes start fading (delayed more)
  strokeFadeDuration: 15.0,     // Gradual stroke removal (slower)
  textEmergeStart: 8.0,         // Text emerges
  textEmergeDuration: 8.0,      // Text fade duration (slower)

  // End
  holdFinal: 20.0               // Ecosystem stabilizes (longer)
};

// Recalculate phase start times based on current timeline
function recalculatePhaseStarts() {
  TIMELINE.phase2Start = TIMELINE.phase1Start + TIMELINE.rectForm + TIMELINE.breathInhale +
                         TIMELINE.breathHold + TIMELINE.breathExhale + TIMELINE.releaseGrow +
                         TIMELINE.ghostFade;
  TIMELINE.phase3Start = TIMELINE.phase2Start + TIMELINE.tangentAppear;
  TIMELINE.phase4Start = TIMELINE.phase3Start + TIMELINE.gradualFill;
  TIMELINE.phase5Start = TIMELINE.phase4Start + TIMELINE.dotsGrow;
}

// ===== DOT SETTINGS =====
const DOT_STYLE = {
  fill: [255, 255, 255],
  stroke: [0, 149, 255],
  strokeWeight: 1.2  // Thicker blue outlines for bubble texture
};

const RECT_DOT_SPACING = 12;  // spacing for rectangle border dots
const RECT_DOT_RADIUS = 3;
const RECT_PADDING = 30;      // padding around Times/Language (increased to avoid dot overlap)
let RECT_GROW_SCALE = 1.2;  // how much rectangle grows (now dynamic)
let TEXT_GROW_SCALE = 1.15; // how much text grows (now dynamic)
const RECT_POSTER_MARGIN = 20; // margin from poster edges when rectangle grows to poster size

let TANGENT_THRESHOLD = 0.15;  // how "straight" an edge must be (now dynamic)
let TANGENT_DOT_RADIUS = 3;  // Same as fill dots (now dynamic)
let TANGENT_SPACING = 15;  // Spacing for sampling tangent dots (now dynamic)

let FILL_TARGET = 0.45;  // 45% fill for 2026 (now dynamic)
let FILL_TARGET_SMALL = 0.5;  // 50% fill for small text (now dynamic)
let FILL_DOT_RADIUS = 3;  // (now dynamic)
let FILL_SPACING_2026 = 15;  // Spacing for 2026 fill dots (now dynamic)
let FILL_SPACING_OTHER = 4;  // Spacing for other text fill dots (now dynamic)

// Phase 4: The Bloom - Aggressive expansion contrast
let DOT_GROW_2026 = 13;  // 2026 dots balloon aggressively (now dynamic)
let DOT_GROW_OTHER = 5;  // Other dots grow but stay smaller (now dynamic)
let STROKE_GROW_MAX = 3.5;  // Thick blue outlines at peak (now dynamic)

// The Rupture: Separation of scales
let BLUE_DOT_PERCENTAGE = 0.7;  // 70% become blue dots (now dynamic)
const BLUE_DOT_SHRINK_2026 = 0.25;  // Not used (2026 dots stay white)
let BLUE_DOT_SHRINK_OTHER = 0.25;  // Blue dots shrink (now dynamic)
const WHITE_FADE_RATE = 0.015;  // White bubbles slowly fade/dissipate

// Phase 5: Emergent behavior - dots have personalities
let BASE_SPEED = 0.12;              // Base Brownian motion for small dots (now dynamic)
let LARGE_DOT_SPEED = 1.2;          // Much faster, more fluid movement for large white dots (now dynamic)
let FLOAT_DAMPING = 0.95;           // Less damping for more fluid movement (now dynamic)
let KINSHIP_RADIUS = 100;           // How far dots "feel" their kin (now dynamic)
let CROWDING_THRESHOLD = 8;         // Too many neighbors = crowded (now dynamic)

// Personality distribution (percentages)
let LEADER_PERCENT = 0.15;          // 15% leaders (now dynamic)
let FOLLOWER_PERCENT = 0.30;        // 30% followers (now dynamic)
let LONER_PERCENT = 0.20;           // 20% loners (now dynamic)
// Wanderer percent = 1 - (leader + follower + loner)

// Personality forces and speeds
let LEADER_SPEED = 1.8;             // Leaders move faster (now dynamic)
let FOLLOWER_SPEED = 1.0;           // Followers normal speed (now dynamic)
let FOLLOWER_ATTRACT = 0.025;       // Followers attracted to kin (now dynamic)
let LONER_SPEED = 1.2;              // Loners move faster (now dynamic)
let LONER_REPEL = 0.04;             // Loners repelled when crowded (now dynamic)
let WANDERER_SPEED = 0.9;           // Wanderers slower (now dynamic)
const WANDERER_IGNORE = 0.0;        // Wanderers ignore others

// Blue dot snake behavior - Grid-based Markov walk with eating/cutting
let BLUE_DISPERSION_TIME = 3.0;     // Initial explosion/dispersion time (seconds) (now dynamic)
let BLUE_DISPERSION_SPEED = 2.0;    // Speed multiplier during dispersion (now dynamic)
let BLUE_GRID_SIZE = 8;             // Grid cell size for discrete movement (now dynamic)
let BLUE_STEP_INTERVAL = 0.15;      // Time between steps (seconds) - how fast snakes move (now dynamic)
let BLUE_DIRECTION_CHANGE = 0.15;   // Probability of changing direction each step (now dynamic)
let BLUE_EATING_DISTANCE = 12;      // Distance within which dots can eat each other (now dynamic)
let BLUE_CUTTING_DISTANCE = 8;      // Distance for snake cutting collision (now dynamic)

// Phase 5: Background Data Layer (floating words)
const WORD_EMERGE_DELAY = 3.0;  // Words emerge after rupture begins
const WORD_EMERGE_DURATION = 4.0;  // Slow emergence from grey space
const WORD_DRIFT = 0.8;  // Much faster, more fluid drift
const WORD_DAMPING = 0.96;  // Less damping for more fluid movement

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
let rectFadeOutEnabled = true;  // Set to true to fade out rectangle at end
let cornerDotsOpacity = 1;  // Separate opacity for corner dots (stay visible)
let cornerHandlesOpacity = 1;  // Separate opacity for corner handles (fade with rect)

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

// Phase 5: Floating words
let floatingWords = [];  // Array of word particles that float with Brownian motion

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
  numbersImg = loadImage("assets/images/2026.png");
  topSVG     = loadImage("assets/svg/top-block.svg");
  addrSVG    = loadImage("assets/svg/address-block.svg");
  botLSVG    = loadImage("assets/svg/bottom-left.svg");
  timesImg   = loadImage("assets/images/Times.png");
  langImg    = loadImage("assets/images/Language.png");
  rectangleLinesSVG = loadImage("assets/svg/rectangle-lines.svg");
  textData = loadJSON("assets/data/text-data.json");  // Load exact text positions from Figma
}

function setup() {
  // Create canvas in the container
  cnv = createCanvas(BASE_W, BASE_H);
  cnv.parent('canvas-container');
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
  startTime = millis();
  setupControls();
  console.log("✅ Animation system ready");
}

// Setup control panel event listeners
function setupControls() {
  // Play/Pause button
  const playPauseBtn = document.getElementById('play-pause');
  playPauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    playPauseBtn.textContent = isPaused ? 'Play' : 'Pause';
    if (!isPaused) {
      startTime = millis() - manualTime * 1000;
    }
  });

  // Reset button
  document.getElementById('reset').addEventListener('click', () => {
    manualTime = 0;
    startTime = millis();
    resetAnimation();
  });

  // Scene navigation buttons
  document.querySelectorAll('.scene-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scene = parseInt(btn.dataset.scene);
      jumpToScene(scene);
    });
  });

  // Regenerate buttons
  document.getElementById('regenerate-phase2').addEventListener('click', () => {
    initPhase2();
    initPhase5(); // Re-assign personalities
    console.log('Phase 2 dots regenerated');
  });

  document.getElementById('regenerate-phase3').addEventListener('click', () => {
    initPhase3();
    initPhase5(); // Re-assign personalities
    console.log('Phase 3 dots regenerated');
  });

  document.getElementById('regenerate-phase5').addEventListener('click', () => {
    initPhase5(); // Re-assign personalities
    console.log('Phase 5 personalities regenerated');
  });

  // Setup all parameter listeners
  setupParameterListeners();
}

function setupParameterListeners() {
  // When any control changes, update the corresponding variable
  const controls = {
    'rect-grow-scale': (v) => RECT_GROW_SCALE = v,
    'text-grow-scale': (v) => TEXT_GROW_SCALE = v,
    'tangent-radius': (v) => TANGENT_DOT_RADIUS = v,
    'tangent-threshold': (v) => TANGENT_THRESHOLD = v,
    'tangent-spacing': (v) => TANGENT_SPACING = v,
    'fill-target': (v) => FILL_TARGET = v,
    'fill-target-small': (v) => FILL_TARGET_SMALL = v,
    'fill-radius': (v) => FILL_DOT_RADIUS = v,
    'fill-spacing-2026': (v) => FILL_SPACING_2026 = v,
    'fill-spacing-other': (v) => FILL_SPACING_OTHER = v,
    'dot-grow-2026': (v) => DOT_GROW_2026 = v,
    'dot-grow-other': (v) => DOT_GROW_OTHER = v,
    'stroke-grow-max': (v) => STROKE_GROW_MAX = v,
    'blue-dot-percentage': (v) => BLUE_DOT_PERCENTAGE = v,
    'blue-dot-shrink': (v) => BLUE_DOT_SHRINK_OTHER = v,
    'base-speed': (v) => BASE_SPEED = v,
    'float-damping': (v) => FLOAT_DAMPING = v,
    'kinship-radius': (v) => KINSHIP_RADIUS = v,
    'crowding-threshold': (v) => CROWDING_THRESHOLD = v,
    'leader-percent': (v) => LEADER_PERCENT = v,
    'follower-percent': (v) => FOLLOWER_PERCENT = v,
    'loner-percent': (v) => LONER_PERCENT = v,
    'leader-speed': (v) => LEADER_SPEED = v,
    'follower-speed': (v) => FOLLOWER_SPEED = v,
    'loner-speed': (v) => LONER_SPEED = v,
    'wanderer-speed': (v) => WANDERER_SPEED = v,
    'follower-attract': (v) => FOLLOWER_ATTRACT = v,
    'loner-repel': (v) => LONER_REPEL = v
  };

  Object.keys(controls).forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.addEventListener('input', () => {
        controls[id](parseFloat(elem.value));
      });
    }
  });
}

function resetAnimation() {
  // Reset all phases
  rectOpacity = 0;
  rectScaleX = 1;
  rectScaleY = 1;
  textScale = 1;
  cornerDotsOpacity = 1;
  cornerHandlesOpacity = 1;
  posterOpacity = 1;

  // Re-initialize all systems
  initPhase1();
  initPhase2();
  initPhase3();
  initPhase5();
}

function jumpToScene(scene) {
  const sceneStarts = {
    1: TIMELINE.phase1Start,
    2: TIMELINE.phase2Start,
    3: TIMELINE.phase3Start,
    4: TIMELINE.phase4Start,
    5: TIMELINE.phase5Start
  };

  manualTime = sceneStarts[scene] || 0;
  startTime = millis() - manualTime * 1000;
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
  const spacing = TANGENT_SPACING;  // Use dynamic spacing
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
        opacity: 0,
        delay: Math.random(),  // Random delay 0-1 for asynchronous appearance
        growthDelay: Math.random(),  // Separate delay for growth phase
        scale: 1,  // Individual scale for asynchronous growth
        fate: 'white',  // Initially white, assigned later
        transformProgress: 0  // 0 = white, 1 = fully transformed to blue
      });
    }
  }
  
  return tangentPoints;
}

// ===== PHASE 3: GRADUAL FILL INITIALIZATION =====

function initPhase3() {
  console.log("Initializing Phase 3: Gradual fill");

  // Clear existing fill dots before regenerating
  fillDots = {
    numbers2026: [],
    times: [],
    language: [],
    address: [],
    topBlock: [],
    bottomLeft: []
  };

  // Trace all edges
  traceAllEdges();

  // Sample edges for each element (different percentages for 2026 vs others)
  for (const elementName of Object.keys(allEdges)) {
    const edges = allEdges[elementName];

    // Use different fill targets: less for 2026 (large), more for others (small)
    const fillTarget = elementName === 'numbers2026' ? FILL_TARGET : FILL_TARGET_SMALL;
    const targetCount = Math.floor(edges.length * fillTarget);

    // Randomly sample edges
    const shuffled = [...edges].sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, targetCount);

    // Create dots with random staggered appearance times
    sampled.forEach((edge, i) => {
      fillDots[elementName].push({
        x: edge.x,
        y: edge.y,
        r: FILL_DOT_RADIUS,
        opacity: 0,
        delay: Math.random(),  // Random delay for more organic appearance
        growthDelay: Math.random(),  // Separate delay for growth phase
        scale: 1,  // Individual scale for asynchronous growth
        fate: 'white',  // Initially white, assigned later
        transformProgress: 0  // 0 = white, 1 = fully transformed to blue
      });
    });

    console.log(`  ${elementName}: ${fillDots[elementName].length} fill dots (${Math.round(fillTarget * 100)}% of ${edges.length})`);
  }
}

function traceAllEdges() {
  // Numbers 2026 - use dynamic spacing
  const numbersG = createGraphics(BASE_W, BASE_H);
  numbersG.pixelDensity(1);
  numbersG.clear();
  numbersG.image(numbersImg, 0, 0, BASE_W, BASE_H);
  allEdges.numbers2026 = sampleEdges(traceEdgesFromGraphics(numbersG, EDGE_THRESHOLDS.numbers2026), FILL_SPACING_2026);

  // Small text elements - use dynamic spacing
  const timesG = renderElementToGraphics(timesImg, items.times);
  allEdges.times = sampleEdges(traceEdgesFromGraphics(timesG, EDGE_THRESHOLDS.times), FILL_SPACING_OTHER);

  const langG = renderElementToGraphics(langImg, items.lang);
  allEdges.language = sampleEdges(traceEdgesFromGraphics(langG, EDGE_THRESHOLDS.language), FILL_SPACING_OTHER);

  const addrG = renderElementToGraphics(addrSVG, items.addr);
  allEdges.address = sampleEdges(traceEdgesFromGraphics(addrG, EDGE_THRESHOLDS.address), FILL_SPACING_OTHER);

  const topG = renderElementToGraphics(topSVG, items.top);
  allEdges.topBlock = sampleEdges(traceEdgesFromGraphics(topG, EDGE_THRESHOLDS.topBlock), FILL_SPACING_OTHER);

  const botG = renderElementToGraphics(botLSVG, items.botL);
  allEdges.bottomLeft = sampleEdges(traceEdgesFromGraphics(botG, EDGE_THRESHOLDS.bottomLeft), FILL_SPACING_OTHER);
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
  console.log("Initializing Phase 5: The Rupture & Resurfacing");

  // Assign dots their layer roles and personalities
  // Large bubbles (2026) ALWAYS stay white - never transform to blue
  tangentDots.forEach(dot => {
    // Large bubbles from 2026 stay white (foam)
    dot.fate = 'foam';
    dot.isLarge = true;  // Mark as large bubble
    dot.transformDelay = Math.random();

    // Assign personality (emergent behavior)
    assignPersonality(dot);
  });

  // Same for fill dots
  for (const elementName of Object.keys(fillDots)) {
    fillDots[elementName].forEach(dot => {
      // Large bubbles (2026) stay white, small bubbles (other) can transform to blue
      if (elementName === 'numbers2026') {
        // Large bubbles from 2026 ALWAYS stay white
        dot.fate = 'foam';
        dot.isLarge = true;  // Mark as large bubble
      } else {
        // Small bubbles: 70% transform to even smaller blue dots
        dot.fate = Math.random() < BLUE_DOT_PERCENTAGE ? 'residue' : 'foam';
        dot.isLarge = false;  // Mark as small bubble
      }

      dot.transformDelay = Math.random();

      // Assign personality (emergent behavior)
      assignPersonality(dot);
    });
  }

  // Initialize snake properties for ALL small dots (both white and blue)
  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];
  allDots.forEach(dot => {
    // Small dots (both white and blue) use grid-based snake game
    // Large dots (2026) use normal Brownian motion
    if (!dot.isLarge) {
      dot.snakeDirection = Math.floor(Math.random() * 4); // 0=right, 1=down, 2=left, 3=up
      dot.snakeStepTimer = Math.random() * BLUE_STEP_INTERVAL; // Randomize initial timing
      dot.snakeHead = true;  // Start as independent heads
      dot.snakeFollowing = null;  // Not following anyone
      dot.snakeFollowers = [];  // No followers yet
      dot.snakeLength = 1;  // Length of this snake chain
    }
  });

  // Background: Floating words (data layer)
  initFloatingWords();

  console.log(`  Fate assignment complete:`);
  console.log(`    - Large white bubbles (2026): Brownian motion`);
  console.log(`    - Small white snakes: 30% stay white (grid-based snake game)`);
  console.log(`    - Small blue snakes: 70% transform from white to blue (grid-based snake game)`);
  console.log(`    - Background text: ${floatingWords.length} words`);
}

// Assign personality to each dot (like Conway's Game of Life - simple rules, complex behavior)
function assignPersonality(dot) {
  const roll = Math.random();

  const leaderThreshold = LEADER_PERCENT;
  const followerThreshold = LEADER_PERCENT + FOLLOWER_PERCENT;
  const lonerThreshold = LEADER_PERCENT + FOLLOWER_PERCENT + LONER_PERCENT;

  if (roll < leaderThreshold) {
    // Leaders - move fast, others follow them
    dot.personality = 'leader';
    dot.speedMultiplier = LEADER_SPEED;
  } else if (roll < followerThreshold) {
    // Followers - attracted to nearby kin
    dot.personality = 'follower';
    dot.speedMultiplier = FOLLOWER_SPEED;
  } else if (roll < lonerThreshold) {
    // Loners - repelled by crowding
    dot.personality = 'loner';
    dot.speedMultiplier = LONER_SPEED;
  } else {
    // Wanderers - ignore others, just drift
    dot.personality = 'wanderer';
    dot.speedMultiplier = WANDERER_SPEED;
  }
}

function initFloatingWords() {
  if (!textData || !textData.texts) {
    console.error('Text data not loaded');
    return;
  }

  // Clear existing floating words before regenerating
  floatingWords = [];

  console.log(`Loading ${textData.texts.length} text elements from Figma...`);

  // Process each text node from Figma
  textData.texts.forEach((textNode, index) => {
    // Get clean text (handle multi-line text by removing newlines first)
    const cleanText = textNode.text.replace(/\n/g, ' ').trim();
    if (cleanText.length === 0) return;

    const fontSize = textNode.fontSize;
    const fontWeight = textNode.fontWeight;

    // Break text into 1-4 character chunks
    let i = 0;
    while (i < cleanText.length) {
      // Random chunk size between 1-4 characters
      const chunkSize = Math.floor(Math.random() * 4) + 1;
      const chunk = cleanText.substr(i, chunkSize);

      if (chunk.trim().length > 0) {
        // Randomly position chunks across the entire canvas
        const randomX = random(0, BASE_W);
        const randomY = random(0, BASE_H);

        floatingWords.push({
          text: chunk,
          originalX: randomX,
          originalY: randomY,
          x: randomX,
          y: randomY,
          vx: 0,
          vy: 0,
          opacity: 0,
          fadeDelay: random(0, 1),
          breakDelay: random(0, 1),
          size: fontSize,
          fontWeight: fontWeight,
          textNode: textNode.name
        });
      }

      i += chunkSize;
    }
  });

  console.log(`Created ${floatingWords.length} floating text chunks randomly positioned (1-4 characters each)`);
}

// ===== MAIN DRAW LOOP =====

function draw() {
  if (!systemReady) return;

  // Update time
  if (!isPaused) {
    manualTime = (millis() - startTime) / 1000;
  }

  const t = manualTime;

  // Update parameters from controls
  updateParameters();
  recalculatePhaseStarts();

  // Update time display
  updateTimeDisplay(t);

  // Update all phases
  updatePhase1(t);
  updatePhase2(t);
  updatePhase3(t);
  updatePhase4(t);
  updatePhase5(t);

  // Render
  renderScene(t);
}

function updateTimeDisplay(t) {
  document.getElementById('current-time').textContent = t.toFixed(1);

  // Determine current phase
  let phase = 1;
  if (t >= TIMELINE.phase5Start) phase = 5;
  else if (t >= TIMELINE.phase4Start) phase = 4;
  else if (t >= TIMELINE.phase3Start) phase = 3;
  else if (t >= TIMELINE.phase2Start) phase = 2;

  document.getElementById('current-phase').textContent = phase;
}

// ===== PHASE 1 UPDATE =====

function updatePhase1(t) {
  const p1 = TIMELINE.phase1Start;
  const formEnd = p1 + TIMELINE.rectForm;
  const inhaleEnd = formEnd + TIMELINE.breathInhale;
  const holdEnd = inhaleEnd + TIMELINE.breathHold;
  const exhaleEnd = holdEnd + TIMELINE.breathExhale;
  const releaseEnd = exhaleEnd + TIMELINE.releaseGrow;
  const fadeEnd = releaseEnd + TIMELINE.ghostFade;

  // Target bounds: poster edges with margin
  const targetBounds = {
    x: RECT_POSTER_MARGIN,
    y: RECT_POSTER_MARGIN,
    w: BASE_W - RECT_POSTER_MARGIN * 2,
    h: BASE_H - RECT_POSTER_MARGIN * 2
  };

  // Before phase 1: The Setup
  if (t < p1) {
    rectOpacity = 0;
    cornerDotsOpacity = 0;
    cornerHandlesOpacity = 0;
    rectScaleX = 1;
    rectScaleY = 1;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1;
    return;
  }

  // The Setup: Rectangle fades in
  if (t < formEnd) {
    const progress = (t - p1) / TIMELINE.rectForm;
    rectOpacity = easeOutCubic(progress);
    cornerDotsOpacity = easeOutCubic(progress);
    cornerHandlesOpacity = easeOutCubic(progress);
    rectScaleX = 1;
    rectScaleY = 1;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = 1;
    return;
  }

  // The Breath - INHALE: Rectangle and text expand together (unified breathing)
  if (t < inhaleEnd) {
    const progress = easeBreathIn((t - formEnd) / TIMELINE.breathInhale);

    // Rectangle expands
    const rectScale = 1 + (RECT_GROW_SCALE - 1) * progress;
    rectScaleX = rectScale;
    rectScaleY = rectScale;

    // Text expands in sync with rectangle (unified breath)
    textScale = 1 + (TEXT_GROW_SCALE - 1) * progress;

    rectOpacity = 1;
    cornerDotsOpacity = 1;
    cornerHandlesOpacity = 1;
    rectCurrentBounds = { ...rectInitialBounds };
    return;
  }

  // The Breath - HOLD: Pause at peak inflation
  if (t < holdEnd) {
    rectOpacity = 1;
    cornerDotsOpacity = 1;
    cornerHandlesOpacity = 1;
    rectScaleX = RECT_GROW_SCALE;
    rectScaleY = RECT_GROW_SCALE;
    rectCurrentBounds = { ...rectInitialBounds };
    textScale = TEXT_GROW_SCALE;
    return;
  }

  // The Breath - EXHALE: Rectangle and text contract together (unified breathing)
  if (t < exhaleEnd) {
    const progress = easeBreathOut((t - holdEnd) / TIMELINE.breathExhale);

    // Rectangle contracts
    const rectScale = RECT_GROW_SCALE - (RECT_GROW_SCALE - 1) * progress;
    rectScaleX = rectScale;
    rectScaleY = rectScale;

    // Text contracts in sync with rectangle (unified breath)
    textScale = TEXT_GROW_SCALE - (TEXT_GROW_SCALE - 1) * progress;

    rectOpacity = 1;
    cornerDotsOpacity = 1;
    cornerHandlesOpacity = 1;
    rectCurrentBounds = { ...rectInitialBounds };
    return;
  }

  // The Release: Slow growth to poster edges, locking into place
  if (t < releaseEnd) {
    const progress = easeInOutCubic((t - exhaleEnd) / TIMELINE.releaseGrow);

    rectOpacity = 1;
    cornerDotsOpacity = 1;
    cornerHandlesOpacity = 1;
    rectScaleX = 1;
    rectScaleY = 1;

    // Interpolate bounds from initial to target (poster edges) - "locking into place"
    rectCurrentBounds = {
      x: rectInitialBounds.x + (targetBounds.x - rectInitialBounds.x) * progress,
      y: rectInitialBounds.y + (targetBounds.y - rectInitialBounds.y) * progress,
      w: rectInitialBounds.w + (targetBounds.w - rectInitialBounds.w) * progress,
      h: rectInitialBounds.h + (targetBounds.h - rectInitialBounds.h) * progress
    };
    textScale = 1;
    return;
  }

  // The Ghosting: Rectangle fades, corner dots remain as floating anchors
  if (rectFadeOutEnabled && t < fadeEnd) {
    const progress = (t - releaseEnd) / TIMELINE.ghostFade;
    rectOpacity = 1 - easeOutCubic(progress);
    cornerDotsOpacity = 1;  // Corner dots remain as anchors
    cornerHandlesOpacity = 1 - easeOutCubic(progress);  // Handles fade with rectangle
    rectScaleX = 1;
    rectScaleY = 1;
    rectCurrentBounds = { ...targetBounds };
    textScale = 1;
    return;
  }

  // After ghosting: Only corner dots remain as anchors
  if (rectFadeOutEnabled) {
    rectOpacity = 0;
    cornerDotsOpacity = 1;  // Anchor dots remain visible
    cornerHandlesOpacity = 0;
  } else {
    rectOpacity = 1;
    cornerDotsOpacity = 1;
    cornerHandlesOpacity = 1;
  }
  rectScaleX = 1;
  rectScaleY = 1;
  rectCurrentBounds = { ...targetBounds };
  textScale = 1;
}

// ===== PHASE 2 UPDATE: THE CONSTELLATION =====

function updatePhase2(t) {
  const p2 = TIMELINE.phase2Start;
  const appearEnd = p2 + TIMELINE.tangentAppear;

  if (t < p2) {
    tangentDots.forEach(d => {
      d.opacity = 0;
      d.twinkle = 0;
    });
    return;
  }

  const overallProgress = Math.min(1, (t - p2) / TIMELINE.tangentAppear);

  // The Effect: Dots twinkle into existence (ripple of light)
  tangentDots.forEach(d => {
    // Asynchronous appearance - data points discovered one by one
    const dotProgress = Math.max(0, (overallProgress - d.delay * 0.7) / 0.3);
    const baseOpacity = easeOutCubic(Math.min(1, dotProgress));

    // Twinkling effect: subtle flicker as they appear (stars flickering)
    if (baseOpacity > 0 && baseOpacity < 1) {
      const twinkleFreq = 8 + d.delay * 4;  // Each dot has different twinkle rate
      const twinkle = Math.sin(t * twinkleFreq) * 0.15;  // Subtle flicker
      d.opacity = Math.max(0, Math.min(1, baseOpacity + twinkle));
    } else {
      d.opacity = baseOpacity;
    }
  });
}

// ===== PHASE 3 UPDATE: THE INFUSION =====

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

  // The Accumulation: Slow sprinkle, like rain on pavement
  for (const elementName of Object.keys(fillDots)) {
    fillDots[elementName].forEach(d => {
      // Random dots appear in random spots (not a flood)
      // Heavy randomization for organic sprinkle effect
      const dotProgress = Math.max(0, (overallProgress - d.delay * 0.8) / 0.2);

      // Add slight randomness to the easing for more organic feel
      const randomizedProgress = dotProgress + (Math.random() - 0.5) * 0.05;
      d.opacity = easeOutCubic(Math.min(1, Math.max(0, randomizedProgress)));
    });
  }
}

// ===== PHASE 4 UPDATE: THE BLOOM =====

function updatePhase4(t) {
  const p4 = TIMELINE.phase4Start;
  const growStart = p4 + TIMELINE.dotsGrowStartDelay;
  const growEnd = growStart + TIMELINE.dotsGrow;

  // Before phase 4 or during the wait period (all dots generated, waiting to grow)
  if (t < growStart) {
    dotScale2026 = 1;
    dotScaleOther = 1;
    // Reset all dot scales
    tangentDots.forEach(d => d.scale = 1);
    for (const elementName of Object.keys(fillDots)) {
      fillDots[elementName].forEach(d => d.scale = 1);
    }
    return;
  }

  const overallProgress = Math.min(1, (t - growStart) / TIMELINE.dotsGrow);

  // The Expansion: Synchronized bloom - all dots grow together
  // Use exponential easing for more dramatic "pop" effect
  const bloomEase = (p) => {
    // Starts slow, then explodes outward
    return p < 0.5 ?
      2 * p * p :
      1 - Math.pow(-2 * p + 2, 2) / 2;
  };

  // The Contrast: 2026 dots balloon aggressively
  tangentDots.forEach(d => {
    // Synchronized expansion - all dots grow together
    d.scale = 1 + (DOT_GROW_2026 - 1) * bloomEase(overallProgress);
  });

  // Fill dots: 2026 huge, others smaller
  for (const elementName of Object.keys(fillDots)) {
    const targetScale = elementName === 'numbers2026' ? DOT_GROW_2026 : DOT_GROW_OTHER;
    fillDots[elementName].forEach(d => {
      // Synchronized expansion - all dots grow together
      d.scale = 1 + (targetScale - 1) * bloomEase(overallProgress);
    });
  }

  // Keep global scales for backwards compatibility
  dotScale2026 = 1 + (DOT_GROW_2026 - 1) * overallProgress;
  dotScaleOther = 1 + (DOT_GROW_OTHER - 1) * overallProgress;
}

// ===== PHASE 5 UPDATE: SMOOTH TRANSFORMATIONS =====

function updatePhase5(t) {
  const p5 = TIMELINE.phase5Start;

  // Before Phase 5
  if (t < p5) {
    posterOpacity = 1;
    return;
  }

  // Poster fades out
  posterOpacity = 0;

  const timeSinceP5 = t - p5;
  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];

  // Calculate progress for each transformation
  const blueStart = TIMELINE.blueTransformStart;
  const blueEnd = blueStart + TIMELINE.blueTransformDuration;
  const strokeStart = TIMELINE.strokeFadeStart;
  const strokeEnd = strokeStart + TIMELINE.strokeFadeDuration;

  // 1. SMOOTH COLOR TRANSFORMATION (white → blue for small dots)
  allDots.forEach(dot => {
    if (dot.fate === 'residue' && !dot.isLarge) {
      // Small dots transforming to blue
      if (timeSinceP5 < blueStart) {
        dot.transformProgress = 0;  // Still white
      } else if (timeSinceP5 < blueEnd) {
        // Smooth transition with individual delays
        const progress = (timeSinceP5 - blueStart) / TIMELINE.blueTransformDuration;
        const dotProgress = Math.max(0, (progress - dot.transformDelay * 0.7) / 0.3);
        dot.transformProgress = easeInOutCubic(Math.min(1, dotProgress));
      } else {
        dot.transformProgress = 1;  // Fully blue
      }
    } else {
      // Large dots and small white dots stay white
      dot.transformProgress = 0;
    }
  });

  // 2. SMOOTH STROKE FADE (small dots lose their outlines, large dots keep theirs)
  allDots.forEach(dot => {
    if (dot.isLarge) {
      // Large dots always keep their strokes
      dot.strokeOpacity = 1;
    } else {
      // Small dots gradually lose strokes
      if (timeSinceP5 < strokeStart) {
        dot.strokeOpacity = 1;  // Strokes visible
      } else if (timeSinceP5 < strokeEnd) {
        // Smooth fade
        const progress = (timeSinceP5 - strokeStart) / TIMELINE.strokeFadeDuration;
        dot.strokeOpacity = 1 - easeOutCubic(progress);
      } else {
        dot.strokeOpacity = 0;  // No strokes
      }
    }
  });

  // 3. EMERGENT BEHAVIOR - personality-based interactions
  allDots.forEach(dot => {
    // Initialize velocity if needed
    if (dot.vx === undefined) dot.vx = 0;
    if (dot.vy === undefined) dot.vy = 0;

    // Determine dot type for kinship
    const isBlue = dot.fate === 'residue' && dot.transformProgress > 0.5;
    const isSmallWhite = !dot.isLarge && !isBlue;
    const isLargeWhite = dot.isLarge;

    // Find nearby kin (same type)
    let nearbyKin = [];
    let nearbyLeaders = [];

    for (const other of allDots) {
      if (other === dot) continue;

      // Check if same type
      const otherIsBlue = other.fate === 'residue' && other.transformProgress > 0.5;
      const otherIsSmallWhite = !other.isLarge && !otherIsBlue;
      const otherIsLargeWhite = other.isLarge;

      const sameType = (isBlue && otherIsBlue) ||
                       (isSmallWhite && otherIsSmallWhite) ||
                       (isLargeWhite && otherIsLargeWhite);

      if (!sameType) continue;

      // Check distance
      const dx = other.x - dot.x;
      const dy = other.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < KINSHIP_RADIUS && dist > 5) {
        nearbyKin.push({ other, dx, dy, dist });
        if (other.personality === 'leader') {
          nearbyLeaders.push({ other, dx, dy, dist });
        }
      }
    }

    // Apply personality-based behavior
    const personality = dot.personality || 'wanderer';

    if (personality === 'leader') {
      // Leaders: move confidently, ignore others
      // Just Brownian motion (no social forces)

    } else if (personality === 'follower' && nearbyLeaders.length > 0) {
      // Followers: attracted to nearest leader
      const nearest = nearbyLeaders[0];
      const force = FOLLOWER_ATTRACT;
      dot.vx += (nearest.dx / nearest.dist) * force;
      dot.vy += (nearest.dy / nearest.dist) * force;

    } else if (personality === 'loner' && nearbyKin.length > CROWDING_THRESHOLD) {
      // Loners: repelled when crowded
      let repelX = 0, repelY = 0;
      for (const kin of nearbyKin) {
        repelX -= kin.dx / kin.dist;
        repelY -= kin.dy / kin.dist;
      }
      const repelMag = Math.sqrt(repelX * repelX + repelY * repelY);
      if (repelMag > 0) {
        dot.vx += (repelX / repelMag) * LONER_REPEL;
        dot.vy += (repelY / repelMag) * LONER_REPEL;
      }

    } else if (personality === 'wanderer') {
      // Wanderers: ignore others, just drift
      // Just Brownian motion
    }

    // SMALL DOT SNAKE GAME: Grid-based Markov walk with eating/cutting
    // Both small white and small blue dots use snake mechanics
    const isSmallDot = !dot.isLarge; // Small dots (white or blue)

    // DISPERSION PHASE: Initial explosion before snake game starts
    const inDispersion = timeSinceP5 < BLUE_DISPERSION_TIME;

    if (isSmallDot && inDispersion) {
      // During dispersion: all small dots use fast Brownian motion to spread out
      const speedMult = (dot.speedMultiplier || 1.0) * BLUE_DISPERSION_SPEED;
      dot.vx = dot.vx || 0;
      dot.vy = dot.vy || 0;
      dot.vx += (random() - 0.5) * BASE_SPEED * speedMult;
      dot.vy += (random() - 0.5) * BASE_SPEED * speedMult;

      // Apply damping
      dot.vx *= FLOAT_DAMPING;
      dot.vy *= FLOAT_DAMPING;

      // Update position
      dot.x += dot.vx;
      dot.y += dot.vy;

      // Wrap around screen edges
      if (dot.x < 0) dot.x = BASE_W;
      if (dot.x > BASE_W) dot.x = 0;
      if (dot.y < 0) dot.y = BASE_H;
      if (dot.y > BASE_H) dot.y = 0;

    } else if (isSmallDot && dot.snakeHead) {
      // After dispersion: snake game begins
      // Only snake heads move independently - body segments will follow

      // Update step timer
      dot.snakeStepTimer -= 1/60; // Approximate frame time

      if (dot.snakeStepTimer <= 0) {
        // Time to take a step
        dot.snakeStepTimer = BLUE_STEP_INTERVAL;

        // Markov chain: randomly change direction
        if (Math.random() < BLUE_DIRECTION_CHANGE) {
          dot.snakeDirection = Math.floor(Math.random() * 4);
        }

        // Store previous position for followers
        dot.prevX = dot.x;
        dot.prevY = dot.y;

        // Move in grid-based direction (0=right, 1=down, 2=left, 3=up)
        if (dot.snakeDirection === 0) dot.x += BLUE_GRID_SIZE;       // Right
        else if (dot.snakeDirection === 1) dot.y += BLUE_GRID_SIZE;  // Down
        else if (dot.snakeDirection === 2) dot.x -= BLUE_GRID_SIZE;  // Left
        else if (dot.snakeDirection === 3) dot.y -= BLUE_GRID_SIZE;  // Up

        // Wrap around screen edges
        if (dot.x < 0) dot.x = BASE_W;
        if (dot.x > BASE_W) dot.x = 0;
        if (dot.y < 0) dot.y = BASE_H;
        if (dot.y > BASE_H) dot.y = 0;

        // Update followers chain: each segment moves to the position of the segment ahead
        if (dot.snakeFollowers && dot.snakeFollowers.length > 0) {
          // Start with the head's first follower
          let current = dot.snakeFollowers[0];
          let prevDot = dot;

          while (current) {
            // Store current position before moving
            current.prevX = current.x;
            current.prevY = current.y;

            // Move to the previous dot's old position
            current.x = prevDot.prevX;
            current.y = prevDot.prevY;

            // Move to next in chain
            prevDot = current;
            const currentIndex = dot.snakeFollowers.indexOf(current);
            current = dot.snakeFollowers[currentIndex + 1];
          }
        }
      }

      // Check for eating and cutting with other small dots
      for (const other of allDots) {
        if (other === dot) continue;

        // Only interact with other small dots (both white and blue)
        const otherIsSmallDot = !other.isLarge;
        if (!otherIsSmallDot) continue;

        const dx = other.x - dot.x;
        const dy = other.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // EATING: Two heads collide
        if (dist < BLUE_EATING_DISTANCE && dot.snakeHead && other.snakeHead) {
          // Larger snake eats smaller (or random if same size)
          const myLength = dot.snakeLength || 1;
          const otherLength = other.snakeLength || 1;

          if (myLength >= otherLength) {
            // I eat the other
            other.snakeHead = false;
            other.snakeFollowing = dot;
            dot.snakeFollowers = dot.snakeFollowers || [];
            dot.snakeFollowers.push(other);

            // Add other's followers to me
            if (other.snakeFollowers && other.snakeFollowers.length > 0) {
              dot.snakeFollowers = dot.snakeFollowers.concat(other.snakeFollowers);
              other.snakeFollowers.forEach(f => f.snakeFollowing = dot);
            }

            dot.snakeLength = dot.snakeFollowers.length + 1;
            other.snakeFollowers = [];
            other.snakeLength = 1;
          }
        }

        // CUTTING: My head collides with other's body
        if (dist < BLUE_CUTTING_DISTANCE && dot.snakeHead && !other.snakeHead) {
          // Cut the other snake at this segment
          if (other.snakeFollowing) {
            const head = other.snakeFollowing;

            // Remove this segment from head's followers
            const index = head.snakeFollowers.indexOf(other);
            if (index > -1) {
              head.snakeFollowers.splice(index, 1);
              head.snakeLength = head.snakeFollowers.length + 1;
            }

            // This segment becomes a new head
            other.snakeHead = true;
            other.snakeFollowing = null;
            other.snakeDirection = Math.floor(Math.random() * 4);
          }
        }
      }

    } else if (isSmallDot && !dot.snakeHead) {
      // Small dot body segments don't move independently - they're moved by their head
      // Just ensure velocity is zero
      dot.vx = 0;
      dot.vy = 0;
    }

    // LARGE WHITE DOTS: Normal Brownian motion (only large dots use free movement)
    if (dot.isLarge) {
      // Add random force (Brownian motion) - scaled by personality, faster speed
      const speedMult = dot.speedMultiplier || 1.0;
      dot.vx += (random() - 0.5) * LARGE_DOT_SPEED * speedMult;
      dot.vy += (random() - 0.5) * LARGE_DOT_SPEED * speedMult;

      // Apply damping
      dot.vx *= FLOAT_DAMPING;
      dot.vy *= FLOAT_DAMPING;

      // Update position
      dot.x += dot.vx;
      dot.y += dot.vy;

      // Wrap around screen edges (more freedom to roam)
      if (dot.x < -50) dot.x = BASE_W + 50;
      if (dot.x > BASE_W + 50) dot.x = -50;
      if (dot.y < -50) dot.y = BASE_H + 50;
      if (dot.y > BASE_H + 50) dot.y = -50;
    }
  });

  // 4. Background text emerges
  updateFloatingWords(t, p5 + TIMELINE.textEmergeStart);
}

// Phase 5 is now integrated into updatePhase5 - smooth continuous animation

function updateFloatingWords(t, fadeEnd) {
  const timeSinceFade = t - fadeEnd;

  // Phase 1: Words fade in at original positions (0-1s)
  // Phase 2: Words start breaking apart (1-3s)
  // Phase 3: Words float freely (3s+)

  floatingWords.forEach(word => {
    // Fade in with individual delays (synchronized with posterOpacity fade)
    const fadeInProgress = Math.min(1, timeSinceFade / WORD_BREAK_DELAY);
    const wordFadeProgress = Math.max(0, (fadeInProgress - word.fadeDelay * 0.7) / 0.3);
    word.opacity = easeOutCubic(Math.min(1, wordFadeProgress));

    // Breaking apart phase
    if (timeSinceFade > WORD_BREAK_DELAY) {
      const breakTimeSince = timeSinceFade - WORD_BREAK_DELAY;
      const breakProgress = Math.min(1, breakTimeSince / WORD_BREAK_DURATION);
      const wordBreakProgress = Math.max(0, (breakProgress - word.breakDelay * 0.7) / 0.3);

      if (wordBreakProgress > 0) {
        // Apply Brownian motion
        word.vx += (random() - 0.5) * WORD_DRIFT;
        word.vy += (random() - 0.5) * WORD_DRIFT;

        // Apply damping
        word.vx *= WORD_DAMPING;
        word.vy *= WORD_DAMPING;

        // Update position
        word.x += word.vx;
        word.y += word.vy;

        // Bounce off edges
        if (word.x < 0 || word.x > BASE_W) {
          word.vx *= -0.8;
          word.x = constrain(word.x, 0, BASE_W);
        }
        if (word.y < 0 || word.y > BASE_H) {
          word.vy *= -0.8;
          word.y = constrain(word.y, 0, BASE_H);
        }
      }
    }
  });
}

// Background: Text words emerge from grey space (static data layer)
function updateFloatingWords(t, phase5Start) {
  const timeSinceRupture = t - phase5Start;
  const emergeStart = WORD_EMERGE_DELAY;
  const emergeEnd = emergeStart + WORD_EMERGE_DURATION;

  floatingWords.forEach(word => {
    // Frame 13: The Resurfacing - text becomes primary focus
    if (timeSinceRupture < emergeStart) {
      word.opacity = 0;
    } else if (timeSinceRupture < emergeEnd) {
      // Slow emergence from grey negative space
      const emergeProgress = (timeSinceRupture - emergeStart) / WORD_EMERGE_DURATION;
      const wordProgress = Math.max(0, (emergeProgress - word.fadeDelay * 0.7) / 0.3);
      word.opacity = easeOutCubic(Math.min(1, wordProgress));
    } else {
      word.opacity = 1;
    }

    // Words drift with more visible, fluid movement
    if (word.opacity > 0) {
      word.vx += (random() - 0.5) * WORD_DRIFT;
      word.vy += (random() - 0.5) * WORD_DRIFT;
      word.vx *= WORD_DAMPING;
      word.vy *= WORD_DAMPING;

      word.x += word.vx;
      word.y += word.vy;

      // Keep on screen
      word.x = constrain(word.x, 0, BASE_W);
      word.y = constrain(word.y, 0, BASE_H);
    }
  });
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

  // Draw Phase 1 rectangle and corner elements
  if (rectOpacity > 0 || cornerDotsOpacity > 0 || cornerHandlesOpacity > 0) {
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

    // Draw rectangle with consistent stroke (if visible)
    if (rectOpacity > 0) {
      push();
      noFill();
      stroke(58, 141, 237, rectOpacity * 255); // #3A8DED
      strokeWeight(1);
      rect(drawX, drawY, drawW, drawH);
      pop();
    }

    // Draw corner dots and handles (separate opacities)
    if (cornerDotsOpacity > 0 || cornerHandlesOpacity > 0) {
      drawCornerElements(cornerDotsOpacity, cornerHandlesOpacity, drawX, drawY, drawW, drawH);
    }
  }

  // RENDERING ORDER (bottom to top): Text -> Small dots -> Large dots

  // 1. Draw floating words at the bottom (underneath everything)
  drawFloatingWords();

  // 2. Draw small dots (from small text elements only)
  for (const elementName of Object.keys(fillDots)) {
    if (elementName !== 'numbers2026') {
      // Small dots - draw in middle layer
      const showStroke = posterOpacity > 0;
      drawDots(fillDots[elementName], dotScaleOther, DOT_GROW_OTHER, showStroke, false);
    }
  }

  // 3. Draw large dots on top (tangent dots + 2026 fill dots)
  drawDots(tangentDots, dotScale2026, DOT_GROW_2026, true, true);
  drawDots(fillDots.numbers2026, dotScale2026, DOT_GROW_2026, true, true);
}

function drawCornerElements(dotsOpacity, handlesOpacity, x, y, w, h) {
  // Calculate corners based on actual drawn rectangle
  const corners = {
    topLeft: { x: x, y: y },
    topRight: { x: x + w, y: y },
    bottomLeft: { x: x, y: y + h },
    bottomRight: { x: x + w, y: y + h }
  };

  const blueColor = [58, 141, 237]; // #3A8DED

  // Draw corner handles (small rectangles) - fade out with rectangle
  if (handlesOpacity > 0) {
    push();
    fill(blueColor[0], blueColor[1], blueColor[2], handlesOpacity * 255);
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
  }

  // Draw corner dots (always circular) - stay visible
  if (dotsOpacity > 0) {
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
      stroke(blueColor[0], blueColor[1], blueColor[2], dotsOpacity * 255);
      strokeWeight(1);
      circle(dotX, dotY, dot.outerR * 2);

      // Inner circle (filled)
      fill(blueColor[0], blueColor[1], blueColor[2], dotsOpacity * 255);
      noStroke();
      circle(dotX, dotY, dot.innerR * 2);
      pop();
    }
  }
}

function drawDots(dots, globalScale = 1, maxScale = 1, showStroke = true, is2026 = false) {
  for (const dot of dots) {
    if (dot.opacity <= 0) continue;

    // Use individual dot scale if available, otherwise use global scale
    let scale = dot.scale !== undefined ? dot.scale : globalScale;

    // Determine dot appearance based on fate and transformation progress
    const fate = dot.fate || 'white';
    const transformProgress = dot.transformProgress !== undefined ? dot.transformProgress : 0;

    let fillColor, strokeColor, useStroke, strokeAlpha, dotOpacity;

    // Smooth color transition: white → blue
    if (fate === 'residue' && transformProgress > 0) {
      // Interpolate from white to blue
      const whiteFill = DOT_STYLE.fill;
      const blueFill = DOT_STYLE.stroke;

      const r = whiteFill[0] + (blueFill[0] - whiteFill[0]) * transformProgress;
      const g = whiteFill[1] + (blueFill[1] - whiteFill[1]) * transformProgress;
      const b = whiteFill[2] + (blueFill[2] - whiteFill[2]) * transformProgress;

      fillColor = [r, g, b];
      strokeColor = DOT_STYLE.stroke;
      useStroke = showStroke;
      strokeAlpha = dot.strokeOpacity !== undefined ? dot.strokeOpacity : 1;
      dotOpacity = dot.opacity;

      // Smooth size transition (shrink as they turn blue)
      const shrinkFactor = is2026 ? BLUE_DOT_SHRINK_2026 : BLUE_DOT_SHRINK_OTHER;
      const targetScale = 1 + (scale - 1) * shrinkFactor;
      scale = scale + (targetScale - scale) * transformProgress;

    } else {
      // White bubbles (stay white)
      fillColor = DOT_STYLE.fill;
      strokeColor = DOT_STYLE.stroke;
      useStroke = showStroke;
      strokeAlpha = dot.strokeOpacity !== undefined ? dot.strokeOpacity : 1;
      dotOpacity = dot.opacity;
    }

    // Skip rendering if completely faded
    if (dotOpacity <= 0) continue;

    push();
    fill(fillColor[0], fillColor[1], fillColor[2], dotOpacity * 255);

    if (useStroke && strokeColor && strokeAlpha > 0) {
      stroke(strokeColor[0], strokeColor[1], strokeColor[2], dotOpacity * 255 * strokeAlpha);
      // The Texture: Thick blue outlines for bubble effect
      const progress = maxScale > 1 ? (scale - 1) / (maxScale - 1) : 0;
      const strokeScale = 1 + progress * (STROKE_GROW_MAX - 1);  // 1x to 3.5x
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
  // Get canvas container dimensions (accounting for control panel width)
  const container = document.getElementById('canvas-container');
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;

  const scale = Math.min(containerW / BASE_W, containerH / BASE_H) * 0.9; // 0.9 for padding
  const cssW = Math.round(BASE_W * scale);
  const cssH = Math.round(BASE_H * scale);
  cnv.style("width", cssW + "px");
  cnv.style("height", cssH + "px");
  cnv.style("margin", "auto");
  cnv.style("display", "block");
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

// Breathing easing - mimics organic inhale/exhale with sine wave
function easeBreath(t) {
  // Sine wave easing: slow start, accelerate middle, slow end (like a breath)
  return (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
}

// Smooth breath in - starts slow, accelerates
function easeBreathIn(t) {
  return Math.sin(t * Math.PI / 2);
}

// Smooth breath out - starts fast, decelerates
function easeBreathOut(t) {
  return 1 - Math.cos(t * Math.PI / 2);
}

// ===== FLOATING WORDS RENDERING =====

function drawFloatingWords() {
  if (floatingWords.length === 0) return;

  push();
  textFont('IBM Plex Mono, monospace');  // Use IBM Plex Mono (exact font from Figma)
  textAlign(LEFT, TOP);  // Align left/top to match original SVG positioning
  noStroke();

  for (const word of floatingWords) {
    if (word.opacity > 0) {
      push();
      fill(0, 10, 27, word.opacity * 255);  // Match the SVG text color #000A1B
      textSize(word.size);

      // Apply font weight (p5.js doesn't have direct fontWeight, but we can use textStyle)
      if (word.fontWeight >= 700) {
        textStyle(BOLD);
      } else if (word.fontWeight >= 500) {
        textStyle(NORMAL);  // Medium weight = normal in p5.js
      } else {
        textStyle(NORMAL);
      }

      text(word.text, word.x, word.y);
      pop();
    }
  }

  pop();
}
