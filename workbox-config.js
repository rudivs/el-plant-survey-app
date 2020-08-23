module.exports = {
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
};
