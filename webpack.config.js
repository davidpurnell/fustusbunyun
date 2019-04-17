const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");

const parts = require("./webpack.parts.js");

const PATHS = {
  app: path.join(__dirname, "src"),
  build: path.join(__dirname, "dist")
};

const commonConfig = merge([
  {
    entry: PATHS.app + "/affable.js",
    output: {
      path: PATHS.build,
      chunkFilename: "[name].[chunkhash:4].js",
      filename: "[name].[chunkhash:4].js"
    },
    resolve: {
      extensions: [".js"],
      alias: {
        jquery: "jquery/dist/jquery.js"
      }
    }
  }
]);

const productionConfig = merge([
  parts.clean(),
  parts.extractCSS({ html: PATHS.app + "/index.ejs" }),
  parts.loadJavaScript({ include: PATHS.app }),
  parts.minifyJavaScript(),
  parts.loadImages({
    options: {
      plugins: [
        require("imagemin-jpegtran")({
          progressive: true,
          arithmetic: false
        }),
        require("imagemin-gifsicle")({
          interlaced: true,
          optimizationLevel: 2
        }),
        require("imagemin-svgo")({
          plugins: [
            { removeViewBox: true },
            { removeTitle: true },
            { convertPathData: false },
            { cleanupIDs: false }
          ]
        }),
        require("imagemin-optipng")({
          optimizationLevel: 5,
          bitDepthReduction: true,
          colorTypeReduction: true,
          paletteReduction: true
        })
      ]
    }
  }),
  parts.buildPage(PATHS)
]);

const developmentConfig = merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT
  }),
  parts.loadCSS(),
  parts.loadImages(),
  parts.buildPage(PATHS, true)
  // parts.attachRevision()
]);

const analyzeConfig = merge([parts.analyze()]);

module.exports = env => {
  const mode = env.development ? "development" : "production";
  console.log(mode + " mode");
  env.analyze ? console.log("bundle analysis generated\n\n") : false;

  const config = env.development ? developmentConfig : productionConfig;
  const theMerged = env.analyze
    ? merge(commonConfig, analyzeConfig, config, { mode })
    : merge(commonConfig, config, { mode });

  return theMerged;
};
