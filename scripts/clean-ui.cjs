const fs = require('fs');
const path = require('path');

const targets = [
  'src/app/training/Entrenamiento.jsx',
  'src/app/analytics/Reportes.jsx',
  'src/shared/ui/InstallAppBanner.jsx'
];

for (const file of targets) {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Remove ambient glows entirely (match the comment and the next div)
  content = content.replace(/\{\/\*\s*Ambient glow\s*\*\/\}\s*<div[^>]*><\/div>/gi, '');
  content = content.replace(/\{\/\*\s*Ambient glow\s*\*\/\}\s*<div[^>]*\/>/gi, '');
  
  // Replace remaining neon RGBA
  content = content.replace(/rgba\(200,\s*255,\s*0/gi, 'rgba(184,115,76');
  content = content.replace(/rgba\(200,255,0/gi, 'rgba(184,115,76');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Cleaned: ${fullPath}`);
  }
}
