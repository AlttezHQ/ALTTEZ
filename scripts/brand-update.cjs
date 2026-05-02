const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

// Map of replacements to make
const replacements = [
  // 1. Rename 'blue' to 'cobre' in Tailwind classes and variables (case-sensitive)
  { regex: /text-blue/g, replacement: 'text-cobre' },
  { regex: /bg-blue/g, replacement: 'bg-cobre' },
  { regex: /border-blue/g, replacement: 'border-cobre' },
  { regex: /ring-blue/g, replacement: 'ring-cobre' },
  { regex: /shadow-blue/g, replacement: 'shadow-cobre' },
  { regex: /fill-blue/g, replacement: 'fill-cobre' },
  { regex: /stroke-blue/g, replacement: 'stroke-cobre' },
  { regex: /from-blue/g, replacement: 'from-cobre' },
  { regex: /via-blue/g, replacement: 'via-cobre' },
  { regex: /to-blue/g, replacement: 'to-cobre' },
  { regex: /PALETTE\.blue/g, replacement: 'PALETTE.cobre' },
  
  // 2. Replace specific old color hex and rgba codes with new ones
  // Old Blue (#C9973A / 201,151,58) -> New Cobre (#B8734C / 184,115,76)
  { regex: /#C9973A/gi, replacement: '#B8734C' },
  { regex: /#D9AE58/gi, replacement: '#C48763' }, // hi
  { regex: /#B7832D/gi, replacement: '#8C5A3C' }, // deep
  { regex: /#E7C989/gi, replacement: '#E8CDBD' }, // ice
  { regex: /201,\s*151,\s*58/g, replacement: '184, 115, 76' }, // rgba
  { regex: /201,151,58/g, replacement: '184,115,76' },
  
  // 3. Backgrounds
  { regex: /#FAFAF8/gi, replacement: '#F6F1EA' }, // Marfil
  { regex: /#F5F1EA/gi, replacement: '#FDFDFB' }, // Lighter panel

  // 4. Text color
  { regex: /#171A1C/gi, replacement: '#1F1F1D' }, // Grafito
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting mass replace...');
processDirectory(srcDir);
console.log('Finished mass replace.');
