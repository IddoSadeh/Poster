// ===== POSTER ANIMATION - 11 PHASE SYSTEM =====
// Phase 1: The Breath - Rectangle breathing animation around Times/Language
// Phase 2: The Constellation - Tangent dots twinkle on 2026
// Phase 3: The Infusion - Gradual fill dots sprinkle onto all elements
// Phase 4: The Bloom - Synchronized dot expansion
// Phase 5: The Dispersion - Initial explosion scatters dots
// Phase 6: The Transformation - Small dots turn blue
// Phase 7: The Float - Large dots drift with Brownian motion + attraction
// Phase 8: The Resurfacing - Background text emerges
// Phase 9: The Fade - Strokes disappear from small dots
// Phase 10: The Snake Game - Small dots follow grid-based movement
// Phase 11: The Ecosystem - Final stable state

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

// ===== TIMELINE (seconds) =====
const TIMELINE = {
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

  // Phase 5: The Dispersion - Initial explosion
  phase5Start: 89.0,            // Dispersion begins
  dispersionDuration: 5.0,      // Fast Brownian explosion to scatter dots

  // Phase 6: The Transformation - Color shift
  phase6Start: 94.0,            // Blue transformation (after dispersion completes)
  blueTransformDuration: 0.5,   // Nearly instant transformation to blue

  // Phase 7: The Float - Brownian motion ecosystem
  phase7Start: 94.0,            // Floating behavior begins (after dispersion)
  // Ongoing: Large dots use attraction points, small dots use snake game

  // Phase 8: The Resurfacing - Text emerges from grey space
  phase8Start: 99.0,            // Text starts emerging
  textEmergeDuration: 8.0,      // Text fade-in duration

  // Phase 9: The Fade - Strokes disappear
  phase9Start: 103.0,           // Strokes start fading
  strokeFadeDuration: 15.0,     // Gradual stroke removal

  // Phase 10: The Snake Game - Grid-based movement
  phase10Start: 94.0,           // Snake mechanics active (after dispersion)
  // Ongoing: Small dots follow grid-based Markov walk with eating/cutting

  // Phase 11: The Ecosystem - Final stable state
  phase11Start: 118.0,          // Ecosystem fully stabilized
  largeDotStrokeFadeDuration: 20.0  // Large dots gradually lose strokes
};

// ===== DOT SETTINGS =====
const DOT_STYLE = {
  fill: [255, 255, 255],
  stroke: [0, 149, 255],
  strokeWeight: 1.2  // Thicker blue outlines for bubble texture
};

const RECT_DOT_SPACING = 12;  // spacing for rectangle border dots
const RECT_DOT_RADIUS = 3;
const RECT_PADDING = 30;      // padding around Times/Language (increased to avoid dot overlap)
const RECT_GROW_SCALE = 1.2;  // how much rectangle grows (reduced to avoid going off-screen)
const TEXT_GROW_SCALE = 1.15; // how much text grows (smaller than rectangle)
const RECT_POSTER_MARGIN = 20; // margin from poster edges when rectangle grows to poster size

const TANGENT_THRESHOLD = 0.15;  // how "straight" an edge must be (lower = more points)
const TANGENT_DOT_RADIUS = 3;  // Same as fill dots for consistent large bubble size

const FILL_TARGET = 0.45;  // 45% fill for 2026 - dense large bubbles
const FILL_TARGET_SMALL = 0.5;  // 50% fill for small text - high density
const FILL_DOT_RADIUS = 3;

// Phase 4: The Bloom - Aggressive expansion contrast
const DOT_GROW_2026 = 13;  // 2026 dots balloon aggressively (huge overlapping circles)
const DOT_GROW_OTHER = 5;  // Other dots grow but stay smaller
const STROKE_GROW_MAX = 3.5;  // Thick blue outlines at peak (bubble texture)

// Phase 6: The Transformation - Separation of scales
const BLUE_DOT_PERCENTAGE = 0.7;  // 70% become blue dots (more blue dots)
const BLUE_DOT_SHRINK_2026 = 0.25;  // Not used (2026 dots stay white)
const BLUE_DOT_SHRINK_OTHER = 0.25;  // Blue dots shrink to 25% of small white size (even smaller)
const WHITE_FADE_RATE = 0.015;  // White bubbles slowly fade/dissipate

// Phase 7: Organic floating with attraction points
const BASE_SPEED = 0.12;              // Base Brownian motion for small dots
const LARGE_DOT_SPEED = 0.15;         // Slower Brownian motion for large white dots (reduced for gentler movement)
const FLOAT_DAMPING = 0.97;           // Medium damping for natural deceleration

// Attraction points - 5 focal points scattered across the canvas
const ATTRACTION_POINTS = [
  { x: BASE_W * 0.2, y: BASE_H * 0.25 },   // Top left area
  { x: BASE_W * 0.8, y: BASE_H * 0.3 },    // Top right area
  { x: BASE_W * 0.5, y: BASE_H * 0.5 },    // Center
  { x: BASE_W * 0.3, y: BASE_H * 0.75 },   // Bottom left area
  { x: BASE_W * 0.75, y: BASE_H * 0.7 }    // Bottom right area
];
const ATTRACTION_STRENGTH = 0.03;     // Gentle pull toward nearest point
const MIN_DISTANCE_FROM_POINT = 0.5;  // Dots stop at half a dot's radius from points
const GUST_STRENGTH = 5.0;            // Very strong gusts to blow dots away
const GUST_FREQUENCY = 0.4;           // 40% chance per frame of a gust (very frequent)

// Speed variation (individual variation)
const SPEED_VARIATION_MIN = 0.7;      // Some dots drift slower
const SPEED_VARIATION_MAX = 1.3;      // Some dots drift faster

// Phase 5: Dispersion explosion
const BLUE_DISPERSION_TIME = 3.0;     // Initial explosion/dispersion time (seconds) before snake game starts
const BLUE_DISPERSION_SPEED = 20.0;   // Speed multiplier during dispersion (very fast explosion)

// Phase 10: Snake game - Grid-based Markov walk with eating/cutting
const BLUE_GRID_SIZE = 8;             // Grid cell size for discrete movement
const BLUE_STEP_INTERVAL = 0.15;      // Time between steps (seconds) - how fast snakes move
const BLUE_DIRECTION_CHANGE = 0.15;   // Probability of changing direction each step
const BLUE_EATING_DISTANCE = 12;      // Distance within which dots can eat each other
const BLUE_CUTTING_DISTANCE = 8;      // Distance for snake cutting collision

// Phase 8: Background Data Layer (floating words)
const WORD_EMERGE_DELAY = 3.0;  // Words emerge after rupture begins
const WORD_EMERGE_DURATION = 4.0;  // Slow emergence from grey space
const WORD_DRIFT = 0.8;  // Much faster, more fluid drift
const WORD_DAMPING = 0.96;  // Less damping for more fluid movement
const TEXT_SIZE_SCALE = 1.0;  // Scale factor for floating text size

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

// Phases 5-11: Advanced behaviors
let posterOpacity = 1;  // Opacity of original poster elements
let blobCenters = [];  // Positions of the 5 blobs for 2026 dots

// Phase 8: Floating words
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
  initPhases5to11();

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
  const spacing = 15;  // Moderate spacing for tangent dots
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
  // Numbers 2026 - moderate spacing for dense coverage
  const numbersG = createGraphics(BASE_W, BASE_H);
  numbersG.pixelDensity(1);
  numbersG.clear();
  numbersG.image(numbersImg, 0, 0, BASE_W, BASE_H);
  allEdges.numbers2026 = sampleEdges(traceEdgesFromGraphics(numbersG, EDGE_THRESHOLDS.numbers2026), 15);  // Moderate spacing

  // Small text elements - tight spacing for high density
  const timesG = renderElementToGraphics(timesImg, items.times);
  allEdges.times = sampleEdges(traceEdgesFromGraphics(timesG, EDGE_THRESHOLDS.times), 4);

  const langG = renderElementToGraphics(langImg, items.lang);
  allEdges.language = sampleEdges(traceEdgesFromGraphics(langG, EDGE_THRESHOLDS.language), 4);

  const addrG = renderElementToGraphics(addrSVG, items.addr);
  allEdges.address = sampleEdges(traceEdgesFromGraphics(addrG, EDGE_THRESHOLDS.address), 4);

  const topG = renderElementToGraphics(topSVG, items.top);
  allEdges.topBlock = sampleEdges(traceEdgesFromGraphics(topG, EDGE_THRESHOLDS.topBlock), 4);

  const botG = renderElementToGraphics(botLSVG, items.botL);
  allEdges.bottomLeft = sampleEdges(traceEdgesFromGraphics(botG, EDGE_THRESHOLDS.bottomLeft), 4);
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

// ===== PHASES 5-11: DISPERSION, TRANSFORMATION, FLOAT, TEXT, FADE, SNAKE, ECOSYSTEM =====

function initPhases5to11() {
  console.log("Initializing Phases 5-11: Dispersion → Transformation → Float → Resurfacing → Fade → Snake → Ecosystem");

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
  console.log(`    - Phase 5-7: Large white bubbles (2026) -> Dispersion + Brownian motion`);
  console.log(`    - Phase 6: Small dots -> 70% transform to blue`);
  console.log(`    - Phase 10: Small dots -> Grid-based snake game (white + blue)`);
  console.log(`    - Phase 8: Background text -> ${floatingWords.length} words`);
}

// Assign random speed variation to each dot (organic individual differences)
function assignPersonality(dot) {
  // Each dot drifts at a slightly different speed - creates natural variation
  dot.speedMultiplier = random(SPEED_VARIATION_MIN, SPEED_VARIATION_MAX);

  // Random phase offset for wind response (so dots don't all move in sync)
  dot.windPhase = random(0, TWO_PI);
}

function initFloatingWords() {
  if (!textData || !textData.texts) {
    console.error('Text data not loaded');
    return;
  }

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

  const t = millis() / 1000;

  // Update all phases
  updatePhase1(t);
  updatePhase2(t);
  updatePhase3(t);
  updatePhase4(t);
  updatePhase5(t);  // Dispersion
  updatePhase6(t);  // Transformation
  updatePhase7(t);  // Float
  updatePhase8(t);  // Resurfacing
  updatePhase9(t);  // Fade
  updatePhase10(t); // Snake
  updatePhase11(t); // Ecosystem

  // Render
  renderScene(t);
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

// ===== PHASE 5 UPDATE: THE DISPERSION =====

function updatePhase5(t) {
  const p5 = TIMELINE.phase5Start;

  // Before Phase 5
  if (t < p5) {
    posterOpacity = 1;
    return;
  }

  // Poster fades out immediately at Phase 5 start
  posterOpacity = 0;

  const timeSinceP5 = t - p5;
  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];
  const inDispersion = timeSinceP5 < TIMELINE.dispersionDuration;

  // Dispersion explosion: All dots scatter with fast Brownian motion
  if (inDispersion) {
    allDots.forEach(dot => {
      // Initialize velocity if needed
      if (dot.vx === undefined) dot.vx = 0;
      if (dot.vy === undefined) dot.vy = 0;

      // Fast Brownian explosion
      const speed = dot.isLarge ? LARGE_DOT_SPEED : BASE_SPEED;
      const speedMult = (dot.speedMultiplier || 1.0) * BLUE_DISPERSION_SPEED;
      dot.vx += (random() - 0.5) * speed * speedMult;
      dot.vy += (random() - 0.5) * speed * speedMult;

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
    });
  }
}

// ===== PHASE 6 UPDATE: THE TRANSFORMATION =====

function updatePhase6(t) {
  const p6 = TIMELINE.phase6Start;

  if (t < p6) return;

  const timeSinceP6 = t - p6;
  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];

  // Smooth transformation: outline collapses or disappears for small dots
  allDots.forEach(dot => {
    if (!dot.isLarge) {
      // All small dots (both white and blue) undergo transformation
      if (timeSinceP6 < TIMELINE.blueTransformDuration) {
        // Smooth transition with individual delays
        const progress = timeSinceP6 / TIMELINE.blueTransformDuration;
        const dotProgress = Math.max(0, (progress - dot.transformDelay * 0.7) / 0.3);
        dot.transformProgress = easeInOutCubic(Math.min(1, dotProgress));
      } else {
        dot.transformProgress = 1;  // Transformation complete
      }
    } else {
      // Large dots don't transform
      dot.transformProgress = 0;
    }
  });
}

// ===== PHASE 7 UPDATE: THE FLOAT =====

function updatePhase7(t) {
  const p7 = TIMELINE.phase7Start;

  if (t < p7) return;

  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];

  // Floating behavior for large dots (Brownian motion + attraction points)
  allDots.forEach(dot => {
    if (!dot.isLarge) return;

    // Initialize velocity if needed
    if (dot.vx === undefined) dot.vx = 0;
    if (dot.vy === undefined) dot.vy = 0;

    // Find nearest attraction point
    let nearestPoint = ATTRACTION_POINTS[0];
    let minDist = dist(dot.x, dot.y, nearestPoint.x, nearestPoint.y);
    for (const point of ATTRACTION_POINTS) {
      const d = dist(dot.x, dot.y, point.x, point.y);
      if (d < minDist) {
        minDist = d;
        nearestPoint = point;
      }
    }

    // Calculate minimum allowed distance
    const dotVisualRadius = dot.r * dot.scale;
    const minAllowedDist = dotVisualRadius * MIN_DISTANCE_FROM_POINT;

    // Apply gentle attraction toward nearest point (only if not too close)
    if (minDist > minAllowedDist) {
      const dx = nearestPoint.x - dot.x;
      const dy = nearestPoint.y - dot.y;
      const angle = Math.atan2(dy, dx);
      dot.vx += cos(angle) * ATTRACTION_STRENGTH;
      dot.vy += sin(angle) * ATTRACTION_STRENGTH;
    }

    // Brownian motion (random jittery movement)
    const speedMult = dot.speedMultiplier || 1.0;
    dot.vx += (random() - 0.5) * LARGE_DOT_SPEED * speedMult;
    dot.vy += (random() - 0.5) * LARGE_DOT_SPEED * speedMult;

    // Occasional strong gusts to blow dots away from attraction points
    if (random() < GUST_FREQUENCY && minDist < minAllowedDist * 3) {
      const dx = dot.x - nearestPoint.x;
      const dy = dot.y - nearestPoint.y;
      const angle = Math.atan2(dy, dx);
      dot.vx += cos(angle) * GUST_STRENGTH;
      dot.vy += sin(angle) * GUST_STRENGTH;
    }

    // Apply damping
    dot.vx *= FLOAT_DAMPING;
    dot.vy *= FLOAT_DAMPING;

    // Update position
    dot.x += dot.vx;
    dot.y += dot.vy;

    // Wrap around screen edges
    if (dot.x < -50) dot.x = BASE_W + 50;
    if (dot.x > BASE_W + 50) dot.x = -50;
    if (dot.y < -50) dot.y = BASE_H + 50;
    if (dot.y > BASE_H + 50) dot.y = -50;
  });
}

// ===== PHASE 8 UPDATE: THE RESURFACING =====

function updatePhase8(t) {
  const p8 = TIMELINE.phase8Start;

  if (t < p8) {
    floatingWords.forEach(word => word.opacity = 0);
    return;
  }

  const timeSinceP8 = t - p8;

  // Text emerges from grey space
  floatingWords.forEach(word => {
    if (timeSinceP8 < TIMELINE.textEmergeDuration) {
      // Slow emergence
      const progress = timeSinceP8 / TIMELINE.textEmergeDuration;
      const wordProgress = Math.max(0, (progress - word.fadeDelay * 0.7) / 0.3);
      word.opacity = easeOutCubic(Math.min(1, wordProgress));
    } else {
      word.opacity = 1;
    }

    // Words drift with fluid movement
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

// ===== PHASE 9 UPDATE: THE FADE =====

function updatePhase9(t) {
  const p9 = TIMELINE.phase9Start;

  if (t < p9) {
    // Before Phase 9: all strokes visible
    const allDots = [...tangentDots, ...Object.values(fillDots).flat()];
    allDots.forEach(dot => {
      dot.strokeOpacity = 1;
    });
    return;
  }

  const timeSinceP9 = t - p9;
  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];

  // Strokes gradually fade (small dots only, large dots keep strokes)
  allDots.forEach(dot => {
    if (dot.isLarge) {
      // Large dots always keep their strokes
      dot.strokeOpacity = 1;
    } else {
      // Small dots gradually lose strokes
      if (timeSinceP9 < TIMELINE.strokeFadeDuration) {
        const progress = timeSinceP9 / TIMELINE.strokeFadeDuration;
        dot.strokeOpacity = 1 - easeOutCubic(progress);
      } else {
        dot.strokeOpacity = 0;
      }
    }
  });
}

// ===== PHASE 10 UPDATE: THE SNAKE GAME =====

function updatePhase10(t) {
  const p10 = TIMELINE.phase10Start;

  if (t < p10) return;

  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];

  // Grid-based snake movement for small dots
  allDots.forEach(dot => {
    if (dot.isLarge) return;  // Only small dots use snake mechanics

    if (dot.snakeHead) {
      // Snake heads move independently
      dot.snakeStepTimer -= 1/60;

      if (dot.snakeStepTimer <= 0) {
        dot.snakeStepTimer = BLUE_STEP_INTERVAL;

        // Markov chain: randomly change direction
        if (Math.random() < BLUE_DIRECTION_CHANGE) {
          dot.snakeDirection = Math.floor(Math.random() * 4);
        }

        // Store previous position for followers
        dot.prevX = dot.x;
        dot.prevY = dot.y;

        // Move in grid-based direction
        if (dot.snakeDirection === 0) dot.x += BLUE_GRID_SIZE;
        else if (dot.snakeDirection === 1) dot.y += BLUE_GRID_SIZE;
        else if (dot.snakeDirection === 2) dot.x -= BLUE_GRID_SIZE;
        else if (dot.snakeDirection === 3) dot.y -= BLUE_GRID_SIZE;

        // Wrap around screen edges
        if (dot.x < 0) dot.x = BASE_W;
        if (dot.x > BASE_W) dot.x = 0;
        if (dot.y < 0) dot.y = BASE_H;
        if (dot.y > BASE_H) dot.y = 0;

        // Update followers chain
        if (dot.snakeFollowers && dot.snakeFollowers.length > 0) {
          let current = dot.snakeFollowers[0];
          let prevDot = dot;

          while (current) {
            current.prevX = current.x;
            current.prevY = current.y;
            current.x = prevDot.prevX;
            current.y = prevDot.prevY;

            prevDot = current;
            const currentIndex = dot.snakeFollowers.indexOf(current);
            current = dot.snakeFollowers[currentIndex + 1];
          }
        }
      }

      // Snake eating and cutting interactions
      for (const other of allDots) {
        if (other === dot || other.isLarge) continue;

        const dx = other.x - dot.x;
        const dy = other.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // EATING: Two heads collide
        if (dist < BLUE_EATING_DISTANCE && dot.snakeHead && other.snakeHead) {
          const myLength = dot.snakeLength || 1;
          const otherLength = other.snakeLength || 1;

          if (myLength >= otherLength) {
            other.snakeHead = false;
            other.snakeFollowing = dot;
            dot.snakeFollowers = dot.snakeFollowers || [];
            dot.snakeFollowers.push(other);

            if (other.snakeFollowers && other.snakeFollowers.length > 0) {
              dot.snakeFollowers = dot.snakeFollowers.concat(other.snakeFollowers);
              other.snakeFollowers.forEach(f => f.snakeFollowing = dot);
            }

            dot.snakeLength = dot.snakeFollowers.length + 1;
            other.snakeFollowers = [];
            other.snakeLength = 1;
          }
        }

        // CUTTING: Head collides with body
        if (dist < BLUE_CUTTING_DISTANCE && dot.snakeHead && !other.snakeHead) {
          if (other.snakeFollowing) {
            const head = other.snakeFollowing;
            const index = head.snakeFollowers.indexOf(other);
            if (index > -1) {
              head.snakeFollowers.splice(index, 1);
              head.snakeLength = head.snakeFollowers.length + 1;
            }

            other.snakeHead = true;
            other.snakeFollowing = null;
            other.snakeDirection = Math.floor(Math.random() * 4);
          }
        }
      }
    } else {
      // Body segments don't move independently
      dot.vx = 0;
      dot.vy = 0;
    }
  });
}

// ===== PHASE 11 UPDATE: THE ECOSYSTEM =====

function updatePhase11(t) {
  const p11 = TIMELINE.phase11Start;

  if (t < p11) return;

  const timeSinceP11 = t - p11;
  const allDots = [...tangentDots, ...Object.values(fillDots).flat()];

  // Large dots gradually lose their blue strokes in the final scene
  allDots.forEach(dot => {
    if (dot.isLarge) {
      if (timeSinceP11 < TIMELINE.largeDotStrokeFadeDuration) {
        const progress = timeSinceP11 / TIMELINE.largeDotStrokeFadeDuration;
        dot.strokeOpacity = 1 - easeOutCubic(progress);
      } else {
        dot.strokeOpacity = 0;
      }
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
      // Always show stroke (it will fade based on strokeOpacity in Phase 9)
      drawDots(fillDots[elementName], dotScaleOther, DOT_GROW_OTHER, true, false);
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

    // Smooth transformation: outline collapses or disappears
    if (fate === 'residue' && transformProgress > 0) {
      // Blue dots: Fill transitions white → blue, outline collapses (fades out)
      const whiteFill = DOT_STYLE.fill;
      const blueFill = DOT_STYLE.stroke;

      const r = whiteFill[0] + (blueFill[0] - whiteFill[0]) * transformProgress;
      const g = whiteFill[1] + (blueFill[1] - whiteFill[1]) * transformProgress;
      const b = whiteFill[2] + (blueFill[2] - whiteFill[2]) * transformProgress;

      fillColor = [r, g, b];
      strokeColor = DOT_STYLE.stroke;
      useStroke = showStroke;
      // Stroke fades out during transformation (outline collapses into fill)
      const transformStrokeAlpha = 1 - transformProgress;
      strokeAlpha = dot.strokeOpacity !== undefined ? dot.strokeOpacity * transformStrokeAlpha : transformStrokeAlpha;
      dotOpacity = dot.opacity;

      // Smooth size transition (shrink as they turn blue)
      const shrinkFactor = is2026 ? BLUE_DOT_SHRINK_2026 : BLUE_DOT_SHRINK_OTHER;
      const targetScale = 1 + (scale - 1) * shrinkFactor;
      scale = scale + (targetScale - scale) * transformProgress;

    } else if (fate === 'foam' && transformProgress > 0) {
      // White dots: Fill stays white, outline fades out
      fillColor = DOT_STYLE.fill;
      strokeColor = DOT_STYLE.stroke;
      useStroke = showStroke;
      // Stroke fades out during transformation
      const transformStrokeAlpha = 1 - transformProgress;
      strokeAlpha = dot.strokeOpacity !== undefined ? dot.strokeOpacity * transformStrokeAlpha : transformStrokeAlpha;
      dotOpacity = dot.opacity;
      // Size stays the same for white dots
    } else {
      // Before transformation starts
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
      textSize(word.size * TEXT_SIZE_SCALE);  // Apply scale factor

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
