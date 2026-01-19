/**
 * FIGMA DOT EXTRACTOR - FINAL VERSION
 * Extracts circles from Frame 4 with correct grouping
 *
 * Based on the Figma structure:
 * - Groups 82-107: dots for text behind the 0 (upper part)
 * - Groups 142, 143: the 2026 number dots
 * - Group 146 (contains 142, 143): full 2026
 * - Groups 17, 23, 24, etc: Times dots (Component 13)
 * - Groups 11, 14-16, 18, 21-22, 25, 27: Language dots
 * - Groups 28-34, 46-47, 42, 54: Address dots
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FILE_KEY || 'AKshMrSJcSCktD6O96k9Og';
const TARGET_FRAME_ID = process.env.TARGET_FRAME_ID || '338:2277';  // Frame "4"

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN not found in .env file');
  process.exit(1);
}

const P5_SIZE = { w: 1080, h: 1350 };

// Define which groups belong to which element
const GROUP_MAPPING = {
  // 2026 numbers (the big digits)
  numbers2026: [
    'Group 142', 'Group 143',  // Main number groups
    'Group 80', 'Group 81', 'Group 82', 'Group 83', 'Group 84',
    'Group 87', 'Group 88', 'Group 89', 'Group 90', 'Group 91', 'Group 92',
    'Group 93', 'Group 94', 'Group 95'
  ],
  
  // Background text behind the 0 (upper area)
  backgroundText: [
    'Group 96', 'Group 97', 'Group 98', 'Group 99', 'Group 100',
    'Group 101', 'Group 102', 'Group 103', 'Group 104', 'Group 105',
    'Group 106', 'Group 107', 'Group 108', 'Group 109', 'Group 110',
    'Group 111', 'Group 112', 'Group 113', 'Group 114', 'Group 115',
    'Group 116', 'Group 117', 'Group 118', 'Group 119', 'Group 120',
    'Group 121', 'Group 122', 'Group 123', 'Group 124', 'Group 125',
    'Group 126', 'Group 127', 'Group 128', 'Group 129', 'Group 130',
    'Group 131', 'Group 132', 'Group 133', 'Group 134', 'Group 135',
    'Group 136', 'Group 137', 'Group 138', 'Group 139', 'Group 140',
    'Group 141', 'Group 85', 'Group 86'
  ],
  
  // Times title (Component 13 children)
  times: [
    'Group 17', 'Group 23', 'Group 24'
  ],
  
  // Language title
  language: [
    'Group 11', 'Group 14', 'Group 15', 'Group 16', 'Group 18',
    'Group 21', 'Group 22', 'Group 25', 'Group 27'
  ],
  
  // Address block
  address: [
    'Group 28', 'Group 29', 'Group 30', 'Group 31', 'Group 34',
    'Group 42', 'Group 46', 'Group 47', 'Group 54'
  ],
  
  // Corner handles (UI elements - skip these)
  skip: [
    'Group 189', 'Group 190', 'Group 191', 'Group 192',
    '4', 'Frame 48', 'Frame 51'
  ]
};

async function main() {
  console.log('Fetching Figma file...\n');
  
  const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${TARGET_FRAME_ID}`;
  
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  });
  
  if (!response.ok) {
    console.error('API Error:', response.status);
    return;
  }
  
  const data = await response.json();
  const frameNode = data.nodes[TARGET_FRAME_ID]?.document;
  
  if (!frameNode) {
    console.error('Could not find frame node');
    return;
  }
  
  console.log(`Found frame: "${frameNode.name}"`);
  
  const frameOrigin = {
    x: frameNode.absoluteBoundingBox.x,
    y: frameNode.absoluteBoundingBox.y
  };
  const frameSize = {
    w: frameNode.absoluteBoundingBox.width,
    h: frameNode.absoluteBoundingBox.height
  };
  
  console.log(`Frame size: ${Math.round(frameSize.w)} x ${Math.round(frameSize.h)}`);
  
  // Extract circles with their parent group
  const circles = [];
  
  function extractCircles(node, parentGroup = 'root') {
    let currentGroup = parentGroup;
    if (node.type === 'GROUP' || node.type === 'FRAME') {
      currentGroup = node.name;
    }
    
    if (node.type === 'ELLIPSE' && node.absoluteBoundingBox) {
      const bbox = node.absoluteBoundingBox;
      if (Math.abs(bbox.width - bbox.height) < 2) {
        circles.push({
          id: node.id,
          name: node.name,
          cx: bbox.x + bbox.width / 2,
          cy: bbox.y + bbox.height / 2,
          r: bbox.width / 2,
          group: currentGroup
        });
      }
    }
    
    if (node.children) {
      for (const child of node.children) {
        extractCircles(child, currentGroup);
      }
    }
  }
  
  extractCircles(frameNode);
  console.log(`\nExtracted ${circles.length} circles total`);
  
  // Helper to determine category
  function getCategory(groupName) {
    if (GROUP_MAPPING.skip.includes(groupName)) return 'skip';
    if (GROUP_MAPPING.numbers2026.includes(groupName)) return 'numbers2026';
    if (GROUP_MAPPING.backgroundText.includes(groupName)) return 'backgroundText';
    if (GROUP_MAPPING.times.includes(groupName)) return 'times';
    if (GROUP_MAPPING.language.includes(groupName)) return 'language';
    if (GROUP_MAPPING.address.includes(groupName)) return 'address';
    return 'other';
  }
  
  // Transform and categorize
  const grouped = {
    numbers2026: [],
    backgroundText: [],
    times: [],
    language: [],
    address: [],
    other: []
  };
  
  const scaleX = P5_SIZE.w / frameSize.w;
  const scaleY = P5_SIZE.h / frameSize.h;
  
  for (const c of circles) {
    const category = getCategory(c.group);
    if (category === 'skip') continue;
    
    // Transform to p5 coordinates
    const x = (c.cx - frameOrigin.x) * scaleX;
    const y = (c.cy - frameOrigin.y) * scaleY;
    const r = c.r * scaleX;  // Scale radius
    
    grouped[category].push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      r: Math.round(r * 100) / 100,
      group: c.group
    });
  }
  
  // Summary
  console.log('\nGrouped for p5.js:');
  let total = 0;
  for (const [cat, dots] of Object.entries(grouped)) {
    console.log(`  ${cat}: ${dots.length}`);
    total += dots.length;
  }
  console.log(`  TOTAL: ${total}`);
  
  // Check what's in "other" to help debug
  if (grouped.other.length > 0) {
    const otherGroups = [...new Set(grouped.other.map(d => d.group))];
    console.log(`\n  "other" contains groups: ${otherGroups.join(', ')}`);
  }
  
  // Create output
  const output = {
    meta: {
      sourceFrame: frameNode.name,
      figmaSize: { w: Math.round(frameSize.w), h: Math.round(frameSize.h) },
      p5Size: P5_SIZE,
      totalDots: total,
      extractedAt: new Date().toISOString()
    },
    groups: grouped,
    // Also provide flat array for simple iteration
    allDots: [
      ...grouped.numbers2026,
      ...grouped.backgroundText,
      ...grouped.times,
      ...grouped.language,
      ...grouped.address,
      ...grouped.other
    ]
  };
  
  const fs = await import('fs');
  fs.writeFileSync('dots.json', JSON.stringify(output, null, 2));
  
  console.log('\n✅ Saved to dots.json');
  
  // Preview
  console.log('\nPreview - numbers2026 (first 3):');
  console.log(JSON.stringify(grouped.numbers2026.slice(0, 3), null, 2));
  
  console.log('\nPreview - times (first 3):');
  console.log(JSON.stringify(grouped.times.slice(0, 3), null, 2));
}

main().catch(console.error);
