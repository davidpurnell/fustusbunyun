module.exports = {
  gifsicle: { optimizationLevel: 2, interlaced: true, colors: 10 },
  mozjpeg: { progressive: true, quality: 10 },
  pngquant: { quality: 10 },
  svgo: {
    plugins: [{ removeViewBox: true }, { cleanupIDs: true }]
  },
  webp: { quality: 10 }
};
