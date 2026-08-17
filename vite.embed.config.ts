import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

//
// Library-mode build that compiles the interactive widgets into a single
// self-executing (IIFE) bundle for embedding in a static tensornetwork.org page.
// Output: dist-embed/stoch_kin_widget.js and dist-embed/stoch_kin_widget.css.
// React is bundled in (not externalized) so the artifact is self-contained.
//
// Build with:  npm run build:embed
//
export default defineConfig({
  plugins: [react()],
  define: {
    // library mode does not set this the way the app build does
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/embed.tsx',
      name: 'StochKinWidget',
      formats: ['iife'],
      fileName: () => 'stoch_kin_widget.js',
    },
    rollupOptions: {
      output: {
        // keep the emitted CSS name stable so the page can link it directly
        assetFileNames: 'stoch_kin_widget.[ext]',
      },
    },
  },
})
