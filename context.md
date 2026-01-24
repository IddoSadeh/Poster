# TIMES LANGUAGE 2026 - ANIMATED POSTER

## Project Overview
Animated poster for "Times Language 2026" exhibition. Five-phase animation system built in p5.js with dynamic dot growth, smooth transformations, and emergent behavior patterns.

## Files Structure
```
p5js/
├── index.html             # Entry point (standard animation)
├── sketch.js              # Main animation (complete 5-phase system)
├── interactive.html       # Interactive version with control panel
├── sketch-interactive.js  # Interactive animation with real-time parameter control
├── export-poster.js       # Utility to export poster as PNG
├── export.html            # Export utility page
└── [assets]               # Required images (see below)

tools/
├── extract-final.mjs   # Figma circle extractor
├── extract-text.mjs    # Figma text position extractor
├── inspect-frames.mjs  # Figma frame inspection tool
└── analyze-frames-10-13.mjs  # Frame analysis for Phase 5
```

## Required Assets
- `2026.png` - Large "2026" numbers with glow
- `Times.png` - "Times" title
- `Language.png` - "Language" title
- `topBlock.svg` - Top right text block
- `addressBlock.svg` - Address text
- `bottomLeft.svg` - Bottom left text
- `text-data.json` - Floating word positions from Figma

## Environment Variables
Figma API credentials are stored in `.env` file:
- `FIGMA_TOKEN` - Figma API access token
- `FILE_KEY` - Figma file key
- `TARGET_FRAME_ID` - Target frame ID

## Animation Phases (Total: ~2 minutes 15 seconds)

### Phase 1: The Breath (2.5s - 28.0s)
A breathing graphic design poster - rectangle breathes around "Times Language"

- Rectangle fades in (2.5s)
- Inhale: unified expansion of rectangle + text (4.5s)
- Hold breath at peak (3.0s)
- Exhale: unified contraction back to origin (4.5s)
- Release: slow growth to poster edges (7.0s)
- Ghosting: rectangle fades, corner dots remain as anchors (4.0s)

**Implementation**: Rectangle drawn with p5.js primitives (1px stroke), corner dots/handles drawn separately

### Phase 2: The Constellation (28.0s - 40.0s)
Stars flickering on a horizon - tangent dots appear on "2026"

- Dots appear at horizontal/vertical tangent points on 2026
- Asynchronous appearance over 12 seconds
- Each dot has random delay for organic rippling effect
- Creates mesmerizing twinkling

### Phase 3: The Infusion (40.0s - 70.0s)
Slow, creeping density - dots gradually fill all elements

- Dots appear on all elements (2026, Times, Language, address, etc.)
- **Density**: 15% for 2026 (large), 20% for other text (small)
- Completely randomized timing over 30 seconds
- Creates continuous surprise and discovery

### Phase 4: The Bloom (70.0s - 88.0s)
Ink expanding in water / Popcorn popping

- **Asynchronous growth**: Each dot grows at its own pace (18s)
- **Large bubbles** (2026): grow 13x original size
- **Small bubbles** (other text): grow 5x original size
- Stroke weight scales from 1.2x to 3.5x as dots expand
- Wave-like effect, peak saturation

### Phase 5: Transformation & Emergence (88.0s+)
Smooth metamorphosis with emergent behavior - the ecosystem reveals itself

#### Visual Transformations (smooth, no popping):
- **Poster fade** (88.0s): Original graphics fade out instantly
- **Floating starts** (88.0s+): All dots begin Brownian motion with personalities
- **Blue transformation** (96.0s - 108.0s):
  - 70% of small dots smoothly transition white → blue (12s)
  - Smooth color interpolation (no popping)
  - Blue dots shrink to 25% of small white size
- **Stroke fade** (100.0s - 115.0s):
  - ALL dots gradually lose blue outlines (15s)
  - Final state: pure white and pure blue (no strokes)
- **Text emerges** (96.0s - 104.0s): Background text layer fades in (8s)

#### Three Distinct Bubble Sizes:
1. **Large white bubbles** (from 2026): Always stay white, lose stroke
2. **Small white bubbles** (from other text): 30% stay white, lose stroke
3. **Tiny blue dots** (from other text): 70% transform to blue, lose stroke

#### Emergent Behavior - Dot Personalities:
Each dot assigned personality at Phase 5 start (like Conway's Game of Life):

- **15% Leaders** (1.8x speed): Move fast, ignore others, blaze trails
- **30% Followers** (1.0x speed): Attracted to nearby leaders, create streams
- **20% Loners** (1.2x speed): Repelled when crowded (>8 neighbors), prevent blobs
- **35% Wanderers** (0.9x speed): Ignore everyone, drift randomly

**Result**: Organic trails, dynamic groupings, dots with "life" - no concentric circles

## Key Configuration

**Note**: All parameters below are adjustable in real-time via the interactive version (`interactive.html`).

```javascript
const TIMELINE = {
  phase1Start: 2.5,
  rectForm: 2.5,
  breathInhale: 4.5,
  breathHold: 3.0,
  breathExhale: 4.5,
  releaseGrow: 7.0,
  ghostFade: 4.0,

  phase2Start: 28.0,
  tangentAppear: 12.0,

  phase3Start: 40.0,
  gradualFill: 30.0,

  phase4Start: 70.0,
  dotsGrow: 18.0,

  phase5Start: 88.0,
  blueTransformStart: 8.0,
  blueTransformDuration: 12.0,
  strokeFadeStart: 12.0,
  strokeFadeDuration: 15.0,
  textEmergeStart: 8.0,
  textEmergeDuration: 8.0,

  holdFinal: 20.0
};

// Dot density
const FILL_TARGET = 0.15;           // 15% fill for 2026 (large bubbles)
const FILL_TARGET_SMALL = 0.2;      // 20% fill for small text
const TANGENT_DOT_RADIUS = 3;       // Same as fill dots (uniform size)
const FILL_DOT_RADIUS = 3;

// Dot growth
const DOT_GROW_2026 = 13;           // Large bubbles grow 13x
const DOT_GROW_OTHER = 5;           // Small bubbles grow 5x
const STROKE_GROW_MAX = 3.5;        // Stroke grows 3.5x at peak

// Transformation
const BLUE_DOT_PERCENTAGE = 0.7;    // 70% of small dots turn blue
const BLUE_DOT_SHRINK_OTHER = 0.25; // Blue dots shrink to 25% of small white

// Emergent behavior
const BASE_SPEED = 0.12;            // Base Brownian motion
const KINSHIP_RADIUS = 100;         // How far dots "feel" their kin
const LEADER_SPEED = 1.8;           // Leaders move 1.8x faster
const FOLLOWER_ATTRACT = 0.025;     // Followers attracted to leaders
const LONER_REPEL = 0.04;           // Loners repelled when crowded
const CROWDING_THRESHOLD = 8;       // Too many neighbors = crowded
```

## Sampling Strategy (for performance & aesthetics)

```javascript
// Edge sampling spacing (pixels between dots)
allEdges.numbers2026 = sampleEdges(..., 25);      // Very few large dots
allEdges.times = sampleEdges(..., 6);             // Moderate small dots
allEdges.language = sampleEdges(..., 6);
allEdges.address = sampleEdges(..., 6);
allEdges.topBlock = sampleEdges(..., 6);
allEdges.bottomLeft = sampleEdges(..., 6);

// Tangent detection
const spacing = 25;  // Check every 25 pixels (fewer tangent dots)
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
1. **Phase 1 Rectangle**: p5.js primitives, corner dots stay circular during scaling
2. **Dynamic Text Rendering**: Times/Language rendered every frame for smooth scaling
3. **Edge Tracing**: Scans image pixels for alpha transitions
4. **Asynchronous Appearance**: Each dot has individual `delay` property
5. **Asynchronous Growth**: Each dot has individual `scale` and `growthDelay`
6. **Smooth Transformations**: Color interpolation (white → blue), no popping
7. **Personality System**: Each dot assigned personality for emergent behavior
8. **Screen Wrapping**: Dots wrap around edges for freedom of movement
9. **Floating Words**: Background text layer from Figma positions

### Dot Properties
Each dot tracks:
- `x, y` - Position
- `r` - Radius
- `opacity` - Visibility (0-1)
- `delay` - Appearance delay (Phase 2/3)
- `growthDelay` - Growth delay (Phase 4)
- `scale` - Individual scale factor
- `fate` - 'foam' (white) or 'residue' (blue)
- `isLarge` - true for 2026 dots, false for others
- `transformProgress` - Color transition progress (0-1)
- `strokeOpacity` - Stroke visibility (0-1)
- `personality` - 'leader', 'follower', 'loner', 'wanderer'
- `speedMultiplier` - Movement speed multiplier
- `vx, vy` - Velocity (Phase 5)

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

**Phase 5: Transformation & Emergence**
- Blue transformation timing and duration
- Blue dot percentage and shrink factor
- Float speed and damping
- Kinship radius and crowding threshold
- Personality distribution (leader/follower/loner/wanderer percentages)
- Personality speed multipliers
- Social forces (follower attraction, loner repulsion)
- Text emergence timing
- Regenerate button for new personality assignments

## Figma Integration

The project includes tools to analyze Figma frames:

```bash
cd tools
node inspect-frames.mjs       # List all frames
node analyze-frames-10-13.mjs # Analyze frames 10-13 in detail
node extract-text.mjs         # Extract text positions
```

## Design Philosophy

**Pacing**: Consistent, captivating rhythm throughout (~2m 15s total)
- No jarring fast sections
- Each phase unfolds at a mesmerizing pace
- Longer durations allow appreciation of transformations

**Visual Hierarchy**: Three clear bubble sizes
- Large white (imposing presence)
- Small white (supporting layer)
- Tiny blue (detail/texture)

**Emergence**: Simple personality rules create complex patterns
- No concentric circles or uniform blobs
- Organic trails and dynamic groupings
- Dots with "life" - temporary formations that form and dissolve

**Smooth Transitions**: Everything transforms gradually
- No popping or disappearing
- Color interpolation (not sudden switches)
- Stroke fades applied to all dots uniformly

## Security
- API keys stored in `.env` file (NOT committed to git)
- `.gitignore` excludes `.env` and sensitive files
