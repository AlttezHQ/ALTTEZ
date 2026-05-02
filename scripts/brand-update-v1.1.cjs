const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const tailwindConfig = path.join(__dirname, '../tailwind.config.js');

const replacements = [
  // Hex and RGBA
  { regex: /#B8734C/gi, replacement: '#CE8946' }, // Bronce ALTTEZ
  { regex: /#C48763/gi, replacement: '#D8A06B' }, // Bronce suave
  { regex: /#8c5a3c/gi, replacement: '#A66F38' }, // Bronce deep
  { regex: /184,\s*115,\s*76/g, replacement: '206, 137, 70' }, // RGBA
  { regex: /184,115,76/g, replacement: '206,137,70' },

  // Tailwind Classes and Variable Names
  { regex: /text-cobre/g, replacement: 'text-bronce' },
  { regex: /bg-cobre/g, replacement: 'bg-bronce' },
  { regex: /border-cobre/g, replacement: 'border-bronce' },
  { regex: /ring-cobre/g, replacement: 'ring-bronce' },
  { regex: /shadow-cobre/g, replacement: 'shadow-bronce' },
  { regex: /fill-cobre/g, replacement: 'fill-bronce' },
  { regex: /stroke-cobre/g, replacement: 'stroke-bronce' },
  { regex: /from-cobre/g, replacement: 'from-bronce' },
  { regex: /via-cobre/g, replacement: 'via-bronce' },
  { regex: /to-cobre/g, replacement: 'to-bronce' },
  
  // Specific Variable Names
  { regex: /C\.cobre/g, replacement: 'C.bronce' },
  { regex: /PALETTE\.cobre/g, replacement: 'PALETTE.bronce' },
  { regex: /--color-cobre/g, replacement: '--color-bronce' },
  { regex: /--shadow-cobre/g, replacement: '--shadow-bronce' },
  
  // Words
  { regex: /cobre/g, replacement: 'bronce' },
  { regex: /Cobre/g, replacement: 'Bronce' },
  { regex: /COBRE/g, replacement: 'BRONCE' }
];

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx|css|html)$/.test(file)) {
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

// Update tailwind.config.js separately
if (fs.existsSync(tailwindConfig)) {
  let twContent = fs.readFileSync(tailwindConfig, 'utf8');
  let origTw = twContent;
  for (const { regex, replacement } of replacements) {
    twContent = twContent.replace(regex, replacement);
  }
  if (twContent !== origTw) {
    fs.writeFileSync(tailwindConfig, twContent, 'utf8');
    console.log(`Updated: ${tailwindConfig}`);
  }
}

console.log('Starting v1.1 migration...');
processDirectory(srcDir);
console.log('v1.1 migration completed.');
