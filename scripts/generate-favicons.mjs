import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgPath = path.resolve('public/favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating raster favicon assets from public/favicon.svg...');

  // 180x180 apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ public/apple-touch-icon.png (180x180)');

  // 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');
  console.log('✓ public/icon-192.png (192x192)');

  // 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
  console.log('✓ public/icon-512.png (512x512)');

  // 32x32 png as favicon.ico
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.ico');
  console.log('✓ public/favicon.ico (32x32)');

  console.log('All favicon assets successfully generated.');
}

generate().catch((err) => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});
