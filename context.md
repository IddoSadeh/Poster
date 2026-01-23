I'll build this systematically. Let me create the new animation system.Done! To use: rename `sketch-v2.js` to `sketch.js` (or update `index.html` to reference `sketch-v2.js`).

---

# SUMMARY FOR CONTINUATION

## Project Overview
Animated poster for "Times Language 2026" exhibition. Four-phase animation system built in p5.js with dynamic dot growth.

## Files Structure
```
p5js/
├── index.html          # Entry point
├── sketch.js           # Main animation
├── export-poster.js    # Utility to export poster as PNG
├── export.html         # Export utility page
└── [assets]            # Required images (see below)
```

## Required Assets
- `2026.png` - Large "2026" numbers with glow
- `Times.png` - "Times" title
- `Language.png` - "Language" title
- `topBlock.svg` - Top right text block
- `addressBlock.svg` - Address text
- `bottomLeft.svg` - Bottom left text
- `rectangle-lines.svg` - Rectangle SVG reference (Phase 1 now uses p5.js primitives)
- *(Optional)* `Group 70.svg` - Corner handle icon

## Environment Variables
Figma API credentials are stored in `.env` file:
- `FIGMA_TOKEN` - Figma API access token
- `FILE_KEY` - Figma file key
- `TARGET_FRAME_ID` - Target frame ID

## Animation Phases

### Phase 1: Rectangle Animation (2.5s - 27.0s)
- Blue rectangle with corner dots/handles fades in around "Times Language" (2s)
- Rectangle expands outward uniformly (1.2x scale, 3.5s)
- Text scales up to 1.15x (3s)
- Hold at expanded state (2s)
- Text shrinks back to normal (3s)
- Rectangle shrinks back to initial size (3.5s)
- **Rectangle grows to fit poster edges** (with 20px margin, 5s) - slowly and deliberately
- Rectangle lines fade out (2.5s), **corner dots remain visible**
- **Implementation**: Rectangle drawn with p5.js primitives (consistent 1px stroke), corner dots/handles drawn separately to stay circular during non-uniform scaling
- **Note**: Times/Language are rendered dynamically (not in poster layer) to allow smooth scaling

### Phase 2: Tangent Dots (27.0s - 35.0s)
- Dots appear at points on "2026" where edges are straight (horizontal/vertical tangents)
- **Asynchronous appearance**: Each dot has random delay, creating organic rippling effect (8s total)
- Entrancing, meditative pace

### Phase 3: Gradual Fill (35.0s - 60.0s)
- Dots gradually appear on all elements (2026, Times, Language, address, top, bottom)
- Fills to 60% density
- **Completely randomized timing**: Dots appear organically with no predictable pattern (25s)
- Creates continuous surprise and discovery

### Phase 4: Dot Growth (60.0s - 72.0s)
- **Asynchronous growth**: Each individual dot grows at its own pace with random delays
- 2026 dots (tangent + fill) grow 8x their original size
- Other dots (times, language, address, top, bottom) grow 4x their original size
- Blue borders (stroke) grow from 1x to 2x thickness as dots expand
- Wave-like effect as different dots reach full size at different times (12s)
- Hold at final size for 10 seconds

### Phase 5: Brownian Motion (72.0s+)
- Original text/graphics fade out slowly (3s)
- 2026 dots move toward 5 blob centers with Brownian motion
- Other dots drift freely with gentle Brownian motion
- Very slow, organic movement (20s)

## Key Configuration (top of sketch.js)

```javascript
const TIMELINE = {
  phase1Start: 2.5,
  rectForm: 2.0,          // Slower, more deliberate
  rectGrow: 3.5,
  textGrow: 3.0,
  holdExpanded: 2.0,
  textShrink: 3.0,
  rectShrink: 3.5,
  rectGrowToPoster: 5.0,  // Very slow growth to poster edges
  rectFade: 2.5,          // Slow fade
  phase2Start: 27.0,      // After phase 1 completes
  tangentAppear: 8.0,     // Very slow asynchronous appearance
  phase3Start: 35.0,      // 27.0 + 8.0
  gradualFill: 25.0,      // Very slow, entrancing fill
  phase4Start: 60.0,      // 35.0 + 25.0
  dotsGrow: 12.0,         // Slow asynchronous growth
  phase5Start: 72.0,      // 60.0 + 12.0
  textFadeOut: 3.0,
  blobForm: 20.0,
  holdFinal: 10.0
};

const RECT_PADDING = 30;          // Padding around Times/Language (prevents dot overlap)
const RECT_GROW_SCALE = 1.2;      // Rectangle uniform expansion multiplier
const TEXT_GROW_SCALE = 1.15;     // Text expansion (smaller than rectangle)
const RECT_POSTER_MARGIN = 20;    // Margin from poster edges in final position
const FILL_TARGET = 0.6;          // 60% edge fill
const TANGENT_THRESHOLD = 0.15;   // Lower = more tangent points
const DOT_GROW_2026 = 8;          // 2026 dots grow 8x
const DOT_GROW_OTHER = 4;         // Other dots grow 4x
const rectFadeOutEnabled = true;  // Rectangle lines fade out, dots stay visible
```

## Edge Detection Thresholds
For images with glow/blur (like 2026.png), use higher thresholds:
```javascript
const EDGE_THRESHOLDS = {
  numbers2026: { solid: 200, empty: 180 },  // High = ignores glow
  times:       { solid: 128, empty: 100 },
  // ...
};
```

## Technical Notes

1. **Phase 1 Rectangle**: Drawn with p5.js `rect()` primitives (not SVG) for consistent 1px stroke during non-uniform scaling. Corner dots and handles drawn separately to stay circular. Rectangle animates from initial bounds around Times/Language to poster edges (with margin). Rectangle lines fade out while corner dots remain visible.
2. **Dynamic Text Rendering**: Times/Language are NOT in poster layer - rendered every frame with transform scaling for smooth animation
3. **Edge Tracing**: Scans image pixels, finds where alpha transitions from solid to transparent
4. **Tangent Detection**: Analyzes local edge direction, selects points where edge is mostly horizontal or vertical
5. **Sampling**: Grid-based sampling ensures even dot distribution
6. **Asynchronous Dot Appearance**: Each dot has individual random `delay` property (0-1). Dots appear organically over extended periods creating continuous surprise.
7. **Asynchronous Dot Growth**: Each dot has individual `scale` and `growthDelay` properties. Dots grow at their own pace creating wave-like patterns. 2026 dots (8x), other dots (4x). Stroke weight scales from 1x to 2x as dots grow.
8. **Phase 5 Blob Formation**: 2026 dots assigned to 5 blob centers, move with attraction force and Brownian motion. Other dots drift freely.
9. **Animation Timing**: Slow, entrancing pace designed to mesmerize viewers. Total runtime: ~105 seconds (~1 minute 45 seconds)

## How to Run
```bash
cd p5js
npx serve .
# Open http://localhost:3000
```

## Figma Integration (Optional)
Tools in `/tools/` folder can extract dot coordinates from Figma:
- `extract-final.mjs` - Extracts circles from Figma file
- Uses environment variables from `.env` for credentials (see Environment Variables section)
- Install dotenv: `npm install dotenv`
- Run: `node tools/extract-final.mjs`

## Security
- API keys are stored in `.env` file (NOT committed to git)
- `.gitignore` excludes `.env` and sensitive files