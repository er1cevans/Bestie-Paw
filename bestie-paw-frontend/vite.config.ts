import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function stitchPlugin() {
  return {
    name: 'stitch-jsx-files',
    resolveId(id: string) {
      if (id === 'virtual:app.jsx') {
        return 'virtual:app.jsx';
      }
    },
    load(id: string) {
      if (id === 'virtual:app.jsx') {
        const files = [
          'services.jsx',
          'ui.jsx',
          'public.jsx',
          'dashboard.jsx',
          'health.jsx',
          'social.jsx',
          'settings.jsx',
          'main.jsx'
        ];
        
        let content = `import React, { useState, useEffect, useContext, createContext, useMemo, useCallback, useRef, Fragment, Suspense } from 'react';\n`;
        content += `import ReactDOM from 'react-dom/client';\n\n`;
        
        content += `window.React = React;\n`;
        content += `window.ReactDOM = ReactDOM;\n\n`;
        
        for (const file of files) {
          const filePath = path.resolve(__dirname, 'app', file);
          let fileContent = fs.readFileSync(filePath, 'utf-8');
          
          // Remove duplicate React destructuring to avoid 'symbol has already been declared' in the stitched scope
          fileContent = fileContent.replace(/const\s+\{.*\}\s*=\s*React;/g, '/* removed React destructuring */');
          
          content += `// --- ${file} ---\n`;
          content += fileContent + '\n\n';
        }
        
        return content;
      }
    }
  };
}

export default defineConfig({
  plugins: [stitchPlugin(), react()],
});
