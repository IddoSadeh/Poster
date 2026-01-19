I'll build this systematically. Let me create the new animation system.Done! To use: rename `sketch-v2.js` to `sketch.js` (or update `index.html` to reference `sketch-v2.js`).

---

# SUMMARY FOR CONTINUATION

## Project Overview
Animated poster for "Times Language 2026" exhibition. Three-phase animation system built in p5.js.

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

### Phase 1: Rectangle Animation (1.0s - 6.5s)
- Solid line rectangle (from rectangle.svg) fades in around "Times Language"
- Rectangle expands outward (1.4x scale)
- Text scales up to 1.25x (smaller than rectangle to fit nicely)
- Hold at expanded state
- Text shrinks back to normal
- Rectangle shrinks back
- Rectangle fades out
- **Note**: Times/Language are rendered dynamically (not in poster layer) to allow smooth scaling

### Phase 2: Tangent Dots (6.5s - 7.0s)
- Dots appear at points on "2026" where edges are straight (horizontal/vertical tangents)
- All appear simultaneously with quick pop-in

### Phase 3: Gradual Fill (7.0s - 11.0s)
- Dots gradually appear on all elements (2026, Times, Language, address, top, bottom)
- Fills to 60% density
- Staggered appearance creates wave effect

## Key Configuration (top of sketch.js)

```javascript
const TIMELINE = {
  phase1Start: 1.0,
  rectForm: 0.5,
  rectGrow: 1.0,
  textGrow: 0.8,
  holdExpanded: 0.5,
  textShrink: 0.8,
  rectShrink: 1.0,
  rectFade: 0.5,
  phase2Start: 6.5,
  tangentAppear: 0.3,
  phase3Start: 7.0,
  gradualFill: 4.0,
  holdFinal: 3.0
};

const RECT_GROW_SCALE = 1.4;      // Rectangle expansion multiplier
const TEXT_GROW_SCALE = 1.25;     // Text expansion (smaller than rectangle)
const FILL_TARGET = 0.6;          // 60% edge fill
const TANGENT_THRESHOLD = 0.15;   // Lower = more tangent points
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