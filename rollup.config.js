import merge from 'deepmerge';
// use createSpaConfig for bundling a Single Page App
import { createSpaConfig } from '@open-wc/building-rollup';
import { generateSW } from 'rollup-plugin-workbox';

const baseConfig = createSpaConfig({
  // use the outputdir option to modify where files are output
  outputDir: 'dist',

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
  output: {
    dir: 'dist',
  },
  plugins: [
    generateSW({
      globDirectory: 'dist/',
      globPatterns: ['**/*.{js,html}'],
      swDest: 'dist/sw.js',
      runtimeCaching: [
        {
          urlPattern: /https:\/\/cdn\.jsdelivr\.net/,
          handler: 'CacheFirst',
        },
        {
          urlPattern: /https:\/\/fonts\.googleapis\.com/,
          handler: 'CacheFirst',
        },
        {
          urlPattern: /https:\/\/fonts\.gstatic\.com/,
          handler: 'CacheFirst',
        },
      ],
    }),
  ],

  // alternatively, you can use your JS as entrypoint for rollup and
  // optionally set a HTML template manually
  // input: './app.js',
});
