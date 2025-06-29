const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate a simple SVG icon as a placeholder
const generateSVGIcon = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="#3b82f6" rx="8"/>
  <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">CC</text>
</svg>`;
};

// Generate placeholder screenshots
const generateScreenshot = (name, width, height) => {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f8fafc"/>
  <rect x="20" y="20" width="${width-40}" height="60" fill="#0f172a" rx="8"/>
  <text x="${width/2}" y="55" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${name}</text>
  <rect x="20" y="100" width="${width-40}" height="${height-140}" fill="#e2e8f0" rx="8"/>
  <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="18">Screenshot Placeholder</text>
</svg>`;
};

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...');

// Generate icons
iconSizes.forEach(size => {
  const svg = generateSVGIcon(size);
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(iconPath, svg);
  console.log(`Generated icon: icon-${size}x${size}.svg`);
});

// Generate screenshots
const screenshots = [
  { name: 'Homepage', filename: 'home-desktop.png' },
  { name: 'All Cuts', filename: 'cuts-desktop.png' },
  { name: 'Analytics', filename: 'analytics-desktop.png' }
];

screenshots.forEach(screenshot => {
  const svg = generateScreenshot(screenshot.name, 1280, 720);
  const screenshotPath = path.join(screenshotsDir, screenshot.filename.replace('.png', '.svg'));
  fs.writeFileSync(screenshotPath, svg);
  console.log(`Generated screenshot: ${screenshot.filename.replace('.png', '.svg')}`);
});

console.log('PWA assets generated successfully!');
console.log('Note: These are SVG placeholders. For production, replace with actual PNG images.'); 