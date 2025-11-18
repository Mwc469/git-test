/**
 * Icon generation script for PWA
 * Generates PNG icons from SVG using sharp library
 *
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// For development, we'll create placeholder instructions
// In production, you would use 'sharp' library to convert SVG to PNG

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

console.log('PWA Icon Generation');
console.log('===================\n');

if (!fs.existsSync(svgPath)) {
  console.error('Error: icon.svg not found in public directory');
  process.exit(1);
}

console.log('SVG icon found:', svgPath);
console.log('\nTo generate PNG icons, you have two options:\n');

console.log('Option 1: Use online converter (Quick)');
console.log('  1. Open https://cloudconvert.com/svg-to-png');
console.log('  2. Upload public/icon.svg');
console.log('  3. Generate these sizes:');
sizes.forEach(({ size, name }) => {
  console.log(`     - ${size}x${size}px -> save as ${name}`);
});
console.log('  4. Place all PNG files in the public/ directory\n');

console.log('Option 2: Install sharp and auto-generate (Recommended)');
console.log('  Run the following commands:');
console.log('  npm install --save-dev sharp');
console.log('  node scripts/generate-icons-sharp.js\n');

// Create a helper script that uses sharp
const sharpScript = `/**
 * Auto-generate icons using sharp library
 * Install: npm install --save-dev sharp
 * Run: node scripts/generate-icons-sharp.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateIcons() {
  console.log('Generating PWA icons...\\n');

  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);

    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(\`✓ Generated \${name} (\${size}x\${size})\`);
  }

  console.log('\\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
`;

const sharpScriptPath = path.join(__dirname, 'generate-icons-sharp.js');
fs.writeFileSync(sharpScriptPath, sharpScript);
console.log('Created helper script: scripts/generate-icons-sharp.js\n');

// For now, create placeholder message files
console.log('Creating placeholder files...');
sizes.forEach(({ name }) => {
  const placeholderPath = path.join(publicDir, name + '.todo');
  fs.writeFileSync(placeholderPath, `Generate ${name} from icon.svg (${name})\nSee scripts/generate-icons.js for instructions`);
  console.log(`  Created: ${name}.todo (reminder to generate this icon)`);
});

console.log('\n✓ Setup complete! Follow Option 1 or Option 2 above to generate actual icons.');
