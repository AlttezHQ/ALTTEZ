const fs = require('fs');
const path = require('path');

const crmAppFile = path.join(__dirname, '../src/app/shell/CRMApp.jsx');
let content = fs.readFileSync(crmAppFile, 'utf8');

if (!content.includes('framer-motion')) {
  content = content.replace('import { useNavigate, useLocation, Navigate } from "react-router-dom";', 'import { useNavigate, useLocation, Navigate } from "react-router-dom";\nimport { AnimatePresence, motion } from "framer-motion";');
}

if (!content.includes('<AnimatePresence mode="wait">')) {
  content = content.replace(
    /\{activeModule === "home" && \(/g,
    '<AnimatePresence mode="wait">\n            <motion.div key={activeModule} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25, ease: "easeOut" }} style={{ width: "100%", minHeight: "100vh" }}>\n              {activeModule === "home" && ('
  );
  content = content.replace(
    /<\/ErrorBoundary>\n\s*\)\}\n\n\s*<\/Suspense>/,
    '</ErrorBoundary>\n              )}\n            </motion.div>\n          </AnimatePresence>\n        </Suspense>'
  );
}

fs.writeFileSync(crmAppFile, content, 'utf8');
console.log('CRMApp updated with Framer Motion');

const cssFile = path.join(__dirname, '../src/index.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');
if (!cssContent.includes('.btn-primary')) {
  cssContent += `
/* Animaciones Globales - Manual v1.1 */
.btn-primary {
  background: var(--color-bronce);
  color: #fff;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 14px rgba(206, 137, 70, 0.25);
}
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(23, 26, 28, 0.08);
}
`;
  fs.writeFileSync(cssFile, cssContent, 'utf8');
  console.log('index.css updated with animation classes');
}
