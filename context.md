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
- `rectangle.svg` - Solid line rectangle for Phase 1 animation
- *(Optional)* `Group 70.svg` - Corner handle icon

## Environment Variables
Figma API credentials are stored in `.env` file:
- `FIGMA_TOKEN` - Figma API access token
- `FILE_KEY` - Figma file key
- `TARGET_FRAME_ID` - Target frame ID

## Animation Phases

### Phase 1: Rectangle Animation (1.7s - 10.4s)
- Solid line rectangle (from rectangle.svg) fades in around "Times Language"
- Rectangle expands outward (1.4x scale)
- Text scales up to 1.25x (smaller than rectangle to fit nicely)
- Hold at expanded state
- Text shrinks back to normal
- Rectangle shrinks back
- Rectangle fades out
- **Note**: Times/Language are rendered dynamically (not in poster layer) to allow smooth scaling

### Phase 2: Tangent Dots (10.4s - 11.0s)
- Dots appear at points on "2026" where edges are straight (horizontal/vertical tangents)
- All appear simultaneously with quick pop-in

### Phase 3: Gradual Fill (11.0s - 17.8s)
- Dots gradually appear on all elements (2026, Times, Language, address, top, bottom)
- Fills to 60% density
- Staggered appearance creates wave effect

### Phase 4: Dot Growth (17.8s - 21.2s)
- All dots grow to larger sizes with smooth animation
- 2026 dots (tangent + fill) grow 8x their original size
- Other dots (times, language, address, top, bottom) grow 4x their original size
- Blue borders (stroke) grow from 1x to 2x thickness as dots expand
- Hold at final size for 5 seconds

## Key Configuration (top of sketch.js)

```javascript
const TIMELINE = {
  phase1Start: 1.7,
  rectForm: 0.85,
  rectGrow: 1.7,
  textGrow: 1.4,
  holdExpanded: 0.85,
  textShrink: 1.4,
  rectShrink: 1.7,
  rectFade: 0.85,
  phase2Start: 10.4,
  tangentAppear: 0.5,
  phase3Start: 11.0,
  gradualFill: 6.8,
  phase4Start: 17.8,
  dotsGrow: 3.4,
  holdFinal: 5.0
};

const RECT_GROW_SCALE = 1.4;      // Rectangle expansion multiplier
const TEXT_GROW_SCALE = 1.25;     // Text expansion (smaller than rectangle)
const FILL_TARGET = 0.6;          // 60% edge fill
const TANGENT_THRESHOLD = 0.15;   // Lower = more tangent points
const DOT_GROW_2026 = 8;          // 2026 dots grow 8x
const DOT_GROW_OTHER = 4;         // Other dots grow 4x
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

1. **Phase 1 Rectangle**: Uses solid line SVG (rectangle.svg) instead of dots, scales from center
2. **Dynamic Text Rendering**: Times/Language are NOT in poster layer - rendered every frame with transform scaling for smooth animation
3. **Edge Tracing**: Scans image pixels, finds where alpha transitions from solid to transparent
4. **Tangent Detection**: Analyzes local edge direction, selects points where edge is mostly horizontal or vertical
5. **Sampling**: Grid-based sampling ensures even dot distribution
6. **Phase 4 Dot Growth**: Dots scale with dynamic sizing - 2026 dots (8x), other dots (4x). Stroke weight scales from 1x to 2x as dots grow
7. **Animation Timing**: All phases run ~70% slower (1.7x duration) for a more relaxed viewing experience. Total runtime: ~26 seconds

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