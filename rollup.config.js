import merge from 'deepmerge';
// use createSpaConfig for bundling a Single Page App
import { createSpaConfig } from '@open-wc/building-rollup';
import { generateSW } from 'rollup-plugin-workbox';
import copy from 'rollup-plugin-copy';
// bundle ES modules from node_modules
// https://github.com/rollup/plugins/tree/master/packages/node-resolve
import resolve from '@rollup/plugin-node-resolve';

// Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
// https://github.com/rollup/plugins/tree/master/packages/commonjs
import commonjs from '@rollup/plugin-commonjs';

// Allows the node builtins to be required/imported.
// https://github.com/ionic-team/rollup-plugin-node-polyfills
import nodePolyfills from 'rollup-plugin-node-polyfills';

// use createBasicConfig to do regular JS to JS bundling
// import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createSpaConfig({
  // use the outputdir option to modify where files are output
  // outputDir: 'dist',

  // if you need to support older browsers, such as IE11, set the legacyBuild
  // option to generate an additional build just for this browser
  // legacyBuild: true,

  // development mode creates a non-minified build for debugging or development
  developmentMode: process.env.ROLLUP_WATCH === 'true',

  // set to true to inject the service worker registration into your index.html
  injectServiceWorker: false,
});

export default merge(baseConfig, {
  // if you use createSpaConfig, you can use your index.html as entrypoint,
  // any <script type="module"> inside will be bundled by rollup
  input: './index.html',
  plugins: [
    generateSW({
      globDirectory: 'dist/',
      globPatterns: ['**/*.{js,html}'],
      swDest: 'dist/sw.js',
    }),
    copy({
      targets: [{ src: 'src/favicons/*', dest: 'dist/' }],
    }),
    resolve({ browser: true }),
    commonjs(),
    nodePolyfills(),
  ],

  // alternatively, you can use your JS as entrypoint for rollup and
  // optionally set a HTML template manually
  // input: './app.js',
});
