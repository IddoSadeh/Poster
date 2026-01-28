# TIMES LANGUAGE 2026 - ANIMATED POSTER

## Project Overview
Animated poster for "Times Language 2026" exhibition. Eleven-phase animation system built in p5.js with dynamic dot growth, smooth transformations, and emergent behavior patterns. Features dual movement systems: Brownian motion with attraction points for large dots, and grid-based snake game mechanics for small dots.

## Files Structure
```
p5js/
├── index.html                      # Entry point (standard animation)
├── interactive.html                # Interactive version with control panel
├── src/
│   ├── sketch.js                   # Main animation (complete 11-phase system)
│   └── sketch-interactive.js       # Interactive animation with real-time parameter control
├── export/
│   ├── export.html                 # Export utility page
│   └── export-poster.js            # Utility to export poster as PNG
└── assets/
    ├── images/
    │   ├── 2026.png                # Large "2026" numbers with glow
    │   ├── Times.png               # "Times" title
    │   └── Language.png            # "Language" title
    ├── svg/
    │   ├── top-block.svg           # Top right text block
    │   ├── address-block.svg       # Address text
    │   ├── bottom-left.svg         # Bottom left text
    │   └── rectangle-lines.svg     # Rectangle lines
    └── data/
        └── text-data.json          # Text content from Figma (broken into random 1-4 char chunks)

tools/
├── extract-final.mjs               # Figma circle extractor
├── extract-text.mjs                # Figma text position extractor
├── inspect-frames.mjs              # Figma frame inspection tool
├── analyze-frames-10-13.mjs        # Frame analysis for Phase 5
└── frames-10-15.json               # Frame analysis data
```

## Required Assets
All assets are now organized in the `p5js/assets/` directory:
- **Images** (`assets/images/`): 2026.png, Times.png, Language.png
- **SVG** (`assets/svg/`): top-block.svg, address-block.svg, bottom-left.svg, rectangle-lines.svg
- **Data** (`assets/data/`): text-data.json (text content from Figma, broken into random 1-4 char chunks)

## Environment Variables
Figma API credentials are stored in `.env` file:
- `FIGMA_TOKEN` - Figma API access token
- `FILE_KEY` - Figma file key
- `TARGET_FRAME_ID` - Target frame ID

## Animation Phases (Total: ~2 minutes / 118 seconds)

The animation is divided into 11 distinct phases, each with specific behaviors and visual effects:

### Phase 1: The Breath (2.5s - 28.0s)
A breathing graphic design poster - rectangle breathes around "Times Language"

- **Rectangle fade-in** (2.5s): Rectangle appears around text
- **Inhale** (4.5s): Unified expansion of rectangle + text
- **Hold** (3.0s): Pause at peak inflation
- **Exhale** (4.5s): Unified contraction back to origin
- **Release** (7.0s): Slow growth to poster edges, locking into place
- **Ghosting** (4.0s): Rectangle fades, corner dots remain as anchors

**Implementation**: Rectangle drawn with p5.js primitives (1px stroke), corner dots/handles drawn separately

### Phase 2: The Constellation (28.0s - 40.0s)
Stars flickering on a horizon - tangent dots twinkle on "2026"

- Dots appear at horizontal/vertical tangent points on 2026
- Asynchronous appearance over 12 seconds
- Each dot has random delay for organic rippling effect
- Twinkling effect creates mesmerizing star-like appearance

### Phase 3: The Infusion (40.0s - 70.0s)
Slow, creeping density - dots gradually fill all elements

- Dots sprinkle onto all elements (2026, Times, Language, address, etc.)
- **Density**: 15% for 2026 (large), 20% for other text (small)
- Completely randomized timing over 30 seconds
- Creates continuous surprise and discovery like rain on pavement

### Phase 4: The Bloom (70.0s - 89.0s)
Synchronized expansion - all dots grow together

- **Wait period** (70.0s - 71.0s): All dots fully generated, pause before growth
- **Synchronized growth** (71.0s - 89.0s): All dots expand in unison (18s)
- **Large bubbles** (2026): grow 13x original size
- **Small bubbles** (other text): grow 5x original size
- Stroke weight scales from 1.2x to 3.5x as dots expand
- Exponential easing creates dramatic "pop" effect

### Phase 5: The Dispersion (89.0s - 94.0s)
Initial explosion scatters all dots across the canvas

- **Poster fade**: Original graphics fade out immediately
- **Fast Brownian explosion**: All dots (large and small) scatter with 20x speed
- **All dots stay white with blue borders**: Color transformation happens after dispersion
- **Duration**: 5 seconds of rapid dispersion
- **Purpose**: Spreads dots across entire canvas before specialized behaviors begin
- Creates dramatic explosive "scatter bomb" effect

### Phase 6: The Transformation (94.0s - 94.5s)
Small dots undergo visual transformation (after dispersion completes)

- **Blue dots (70%)**: White fill transitions to blue, outline collapses inward as dot shrinks to 25% size
  - Visual effect: The blue outline becomes the new solid blue fill
- **White dots (30%)**: White fill remains, blue outline fades away completely
  - Visual effect: Outline simply disappears, leaving pure white dot
- Happens AFTER dispersion so dots scatter first, then transform
- Transformation is rapid (0.5s) with individual delays for organic effect
- **Large bubbles** (2026): Don't transform, keep white fill with blue outline

### Phase 7: The Float (94.0s onwards)
Large dots drift with Brownian motion and attraction points

- **5 Attraction Points**: Scattered across canvas creating natural clustering
- **Gentle attraction**: Dots pulled toward nearest point (0.03 strength)
- **Brownian motion**: Random, jittery movement (0.15 speed for large dots)
- **Frequent gusts**: Strong random forces (5.0 strength, 40% frequency)
- **Minimum distance**: Dots stop at half radius from attraction points
- **Individual variation**: Random speed multipliers (0.7x - 1.3x)
- **Medium damping** (0.97): Natural deceleration
- Creates gentle, jittery floating with organic clustering

### Phase 8: The Resurfacing (99.0s - 107.0s)
Background text emerges from grey space

- Text chunks fade in over 8 seconds
- Asynchronous appearance with individual delays
- **Text format**: 1-4 character chunks randomly positioned
- Text rendered at **bottom layer** (underneath all dots)
- Chunks drift with fluid Brownian motion (0.8 speed, 0.96 damping)
- Creates layered depth effect with fragmented, scattered text

### Phase 9: The Fade (103.0s - 118.0s)
Stroke management for small dots

- **Small dots**: Already lost their strokes during Phase 6 transformation
- **Large white dots**: Keep their blue outlines through this phase (fade in Phase 11)
- This phase ensures small dots are stroke-free before the final ecosystem

### Phase 10: The Snake Game (94.0s onwards)
Small dots follow grid-based movement with eating and cutting mechanics (overlaps with Phase 7)

- **Who**: ALL small dots (both white 30% and blue 70%)
- **Grid-based Markov walk**: Discrete 4-directional movement (8px cells)
- **Direction changes**: 15% probability each step
- **Snake eating**: Larger snakes eat smaller ones on head collision
  - Eaten snake becomes body segments
  - Creates chain-following behavior
- **Snake cutting**: Head colliding with body cuts the snake
  - Body segment becomes new independent head
  - Dynamic splitting and reformation
- **Step interval**: 0.15 seconds between moves
- White and blue snakes can eat each other

### Phase 11: The Ecosystem (118.0s onwards)
Final stable state - all systems running in harmony with gradual visual refinement

- All behaviors continue indefinitely
- **Large dots**: Float with attraction points and Brownian motion, blue strokes gradually fade over 20 seconds
- **Small dots**: Continue snake game mechanics (strokes already gone)
- **Text**: Drifts in background layer
- System reaches equilibrium with all elements coexisting
- **Final visual**: Pure white large bubbles with no strokes, creating clean minimal aesthetic

## Three Distinct Bubble Sizes

1. **Large white bubbles** (from 2026): Always stay white and large, blue outlines gradually fade in Phase 11 (118s-138s)
2. **Small white bubbles** (30% of other text): White fill remains, blue outline fades away in Phase 6
3. **Tiny blue dots** (70% of other text): Blue outline collapses inward as white fill becomes blue and shrinks to 25% in Phase 6

## Rendering Order (bottom to top)

1. **Text layer** (bottom): Floating word chunks
2. **Small dots** (middle): White and blue small bubbles
3. **Large dots** (top): Large white bubbles from 2026

## Key Configuration

**Note**: All parameters below are adjustable in real-time via the interactive version (`interactive.html`).

### Timeline Configuration

```javascript
const TIMELINE = {
  // Phase 1: The Breath
  phase1Start: 2.5,
  rectForm: 2.5,        // Rectangle fade-in duration
  breathInhale: 4.5,    // Inhale duration
  breathHold: 3.0,      // Hold at peak duration
  breathExhale: 4.5,    // Exhale duration
  releaseGrow: 7.0,     // Release/lock into place duration
  ghostFade: 4.0,       // Rectangle fade-out duration

  // Phase 2: The Constellation
  phase2Start: 28.0,
  tangentAppear: 12.0,  // Tangent dots appearance duration

  // Phase 3: The Infusion
  phase3Start: 40.0,
  gradualFill: 30.0,    // Fill dots appearance duration

  // Phase 4: The Bloom
  phase4Start: 70.0,
  dotsGrowStartDelay: 1.0,  // Wait before growth begins
  dotsGrow: 18.0,           // Synchronized growth duration

  // Phase 5: The Dispersion
  phase5Start: 89.0,
  dispersionDuration: 5.0,  // Explosion scatter duration

  // Phase 6: The Transformation
  phase6Start: 94.0,            // After dispersion completes
  blueTransformDuration: 0.5,   // Color transformation duration

  // Phase 7: The Float
  phase7Start: 94.0,    // Floating behavior begins

  // Phase 8: The Resurfacing
  phase8Start: 99.0,
  textEmergeDuration: 8.0,  // Text fade-in duration

  // Phase 9: The Fade
  phase9Start: 103.0,
  strokeFadeDuration: 15.0,  // Stroke fade-out duration

  // Phase 10: The Snake Game
  phase10Start: 94.0,   // Overlaps with Phase 7

  // Phase 11: The Ecosystem
  phase11Start: 118.0,  // Final stable state
  largeDotStrokeFadeDuration: 20.0  // Large dots stroke fade duration
};
```

### Dot Configuration

```javascript
// Dot density
const FILL_TARGET = 0.15;           // 15% fill for 2026 (large bubbles)
const FILL_TARGET_SMALL = 0.20;     // 20% fill for small text
const TANGENT_DOT_RADIUS = 3;       // Radius for tangent dots
const FILL_DOT_RADIUS = 3;          // Radius for fill dots

// Dot growth (Phase 4)
const DOT_GROW_2026 = 13;           // Large bubbles grow 13x
const DOT_GROW_OTHER = 5;           // Small bubbles grow 5x
const STROKE_GROW_MAX = 3.5;        // Stroke grows 3.5x at peak
```

### Transformation Configuration (Phase 6)

```javascript
const BLUE_DOT_PERCENTAGE = 0.7;    // 70% of small dots turn blue
const BLUE_DOT_SHRINK_OTHER = 0.25; // Blue dots shrink to 25% of small white
```

### Floating Behavior Configuration (Phase 7)

```javascript
// Brownian motion with attraction points
const BASE_SPEED = 0.12;               // Base Brownian motion for small dots
const LARGE_DOT_SPEED = 0.15;          // Brownian motion speed for large dots
const FLOAT_DAMPING = 0.97;            // Medium damping for deceleration
const ATTRACTION_STRENGTH = 0.03;      // Pull toward nearest attraction point
const MIN_DISTANCE_FROM_POINT = 0.5;   // Stop at half radius from points
const GUST_STRENGTH = 5.0;             // Strong gusts to blow dots away
const GUST_FREQUENCY = 0.4;            // 40% chance per frame of a gust
const SPEED_VARIATION_MIN = 0.7;       // Minimum speed multiplier
const SPEED_VARIATION_MAX = 1.3;       // Maximum speed multiplier
```

### Snake Game Configuration (Phase 10)

```javascript
const BLUE_DISPERSION_TIME = 5.0;   // Initial dispersion duration (Phase 5)
const BLUE_DISPERSION_SPEED = 20.0; // Speed multiplier during dispersion
const BLUE_GRID_SIZE = 8;           // Grid cell size (pixels)
const BLUE_STEP_INTERVAL = 0.15;    // Time between steps (seconds)
const BLUE_DIRECTION_CHANGE = 0.15; // Probability of direction change
const BLUE_EATING_DISTANCE = 12;    // Distance for eating collision (pixels)
const BLUE_CUTTING_DISTANCE = 8;    // Distance for cutting collision (pixels)
```

### Text Layer Configuration (Phase 8)

```javascript
const WORD_DRIFT = 0.8;             // Brownian motion speed for text
const WORD_DAMPING = 0.96;          // Damping for text movement
const TEXT_SIZE_SCALE = 1.0;        // Scale factor for floating text size (0.3x - 3.0x)
```

## Sampling Strategy (for performance & aesthetics)

```javascript
// Edge sampling spacing (pixels between dots)
allEdges.numbers2026 = sampleEdges(..., 25);      // Moderate spacing (configurable)
allEdges.times = sampleEdges(..., 6);             // Tight spacing (configurable)
allEdges.language = sampleEdges(..., 6);
allEdges.address = sampleEdges(..., 6);
allEdges.topBlock = sampleEdges(..., 6);
allEdges.bottomLeft = sampleEdges(..., 6);

// Tangent detection (Phase 2)
const TANGENT_SPACING = 25;  // Check every 25 pixels (configurable via interactive)
const TANGENT_THRESHOLD = 0.15;  // Edge straightness threshold (configurable)
```

## Technical Implementation

### Edge Detection
```javascript
const EDGE_THRESHOLDS = {
  numbers2026: { solid: 200, empty: 180 },  // High threshold for glow
  times:       { solid: 128, empty: 100 },
  language:    { solid: 128, empty: 100 },
  // ...
};
```

### Key Features
1. **11-Phase System**: Modular phase-based animation with clear transitions
2. **Phase 1 Rectangle**: p5.js primitives, corner dots stay circular during scaling
3. **Dynamic Text Rendering**: Times/Language rendered every frame for smooth scaling
4. **Edge Tracing**: Scans image pixels for alpha transitions
5. **Asynchronous Appearance**: Each dot has individual `delay` property (Phases 2-3)
6. **Synchronous Growth**: All dots grow together in unison (Phase 4)
7. **Outline Collapse Transformation**: Blue dots collapse inward while white dots lose outlines (Phase 6)
8. **Dual Movement Systems**:
   - Large dots: Brownian motion with attraction points (Phase 7)
   - Small dots: Grid-based snake game with eating/cutting (Phase 10)
9. **Screen Wrapping**: Dots wrap around edges for freedom of movement
10. **Floating Text Chunks**: Background text broken into 1-4 character chunks, randomly scattered, rendered beneath bubbles (Phase 8)
11. **Real-time Controls**: All parameters adjustable via interactive dashboard

### Dot Properties
Each dot tracks:
- `x, y` - Position
- `r` - Radius
- `opacity` - Visibility (0-1)
- `delay` - Appearance delay (Phase 2/3)
- `growthDelay` - Growth delay (unused, for potential future use)
- `scale` - Individual scale factor
- `fate` - 'foam' (white) or 'residue' (blue)
- `isLarge` - true for 2026 dots, false for others
- `transformProgress` - Color transition progress (0-1)
- `transformDelay` - Individual delay for transformation
- `strokeOpacity` - Stroke visibility (0-1)
- `speedMultiplier` - Random speed variation (0.7 - 1.3x)
- `windPhase` - Phase offset for random motion
- `vx, vy` - Velocity (Phase 5+)

**Snake game properties** (small dots only):
- `snakeDirection` - Movement direction (0-3: right, down, left, up)
- `snakeStepTimer` - Time until next step
- `snakeHead` - Boolean, true if independent head
- `snakeFollowing` - Reference to dot being followed (if body segment)
- `snakeFollowers` - Array of dots following this one
- `snakeLength` - Total length of snake chain
- `prevX, prevY` - Previous position (for follower chain)

## How to Run

### Standard Animation
```bash
cd p5js
npx serve .
# Open http://localhost:3000 (index.html)
```

### Interactive Version with Control Panel
```bash
cd p5js
npx serve .
# Open http://localhost:3000/interactive.html
```

The interactive version includes:
- **Real-time parameter control** for all animation variables
- **Playback controls**: Play/Pause, Reset
- **Scene navigation**: Jump directly to any of the 5 phases
- **Collapsible control sections** organized by phase
- **Regenerate buttons** to apply structural changes (dot sampling, personalities)
- **Live time/phase display**

### Interactive Controls by Phase

**Phase 1: The Breath**
- Rectangle & text grow scales
- Inhale, hold, exhale, release, and ghost fade durations

**Phase 2: The Constellation**
- Appearance duration
- Dot radius, tangent threshold
- Sampling spacing (density control)
- Regenerate button for new dot patterns

**Phase 3: The Infusion**
- Fill duration
- Fill density for 2026 and other text
- Dot radius
- Sampling spacing for 2026 and other text
- Regenerate button for new dot patterns

**Phase 4: The Bloom**
- Growth duration
- 2026 and other dot growth scales
- Stroke growth maximum

**Phase 5: The Dispersion**
- Dispersion duration (explosion time)
- Dispersion speed multiplier

**Phase 6: The Transformation**
- Blue transformation duration
- Blue dot percentage (how many turn blue)
- Blue dot shrink factor

**Phase 7: The Float**
- Base float speed (small dots)
- Large dot speed
- Float damping
- Attraction strength
- Minimum distance from attraction points
- Gust strength and frequency
- Speed variation min/max

**Phase 8: The Resurfacing**
- Text emerge duration
- Text size scale (0.3x - 3.0x)

**Phase 9: The Fade**
- Stroke fade duration

**Phase 10: The Snake Game**
- Grid size
- Step interval (snake speed)
- Direction change probability
- Eating and cutting distances

**Phase 11: The Ecosystem**
- Large dot stroke fade duration (5-60 seconds)
- Regenerate button for all dot properties

## Figma Integration

The project includes tools to analyze Figma frames:

```bash
cd tools
node inspect-frames.mjs       # List all frames
node analyze-frames-10-13.mjs # Analyze frames 10-13 in detail
node extract-text.mjs         # Extract text positions
```

## Design Philosophy

**Pacing**: Consistent, captivating rhythm throughout (~2 minutes total)
- 11 distinct phases with clear transitions
- Each phase unfolds at a mesmerizing pace
- Overlapping phases create continuous evolution
- Longer durations allow appreciation of transformations

**Visual Hierarchy**: Three clear bubble sizes
- Large white (imposing presence)
- Small white (supporting layer)
- Tiny blue (detail/texture)

**Organic Movement**: Natural floating with multiple behavior systems creates dynamic patterns
- **Large dots**: Brownian motion with attraction to 5 focal points
- **Small dots**: Grid-based snake game with eating and cutting mechanics
- Individual speed variation creates natural diversity (0.7x - 1.3x)
- Frequent gusts keep movement dynamic and prevent stagnation
- Emergent complexity from simple rules

**Smooth Transitions**: Everything transforms gradually
- No popping or disappearing
- Color interpolation (not sudden switches)
- Outline collapse effect: strokes fade as dots transform (Phase 6)
- Individual delays create organic, asynchronous transformation

## Security
- API keys stored in `.env` file (NOT committed to git)
- `.gitignore` excludes `.env` and sensitive files
