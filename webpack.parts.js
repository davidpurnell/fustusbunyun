// const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebappWebpackPlugin = require("webapp-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

exports.clean = path => ({
  plugins: [new CleanWebpackPlugin()]
});

// exports.attachRevision = () => ({
//   plugins: [
//     new webpack.BannerPlugin({
//       banner: new GitRevisionPlugin().version()
//     })
//   ]
// });

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    stats: "errors-only",
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    //open: "Google Chrome",
    overlay: {
      warnings: true,
      errors: true
    }
  }
});

exports.loadCSS = () => ({
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: { sourceMap: true }
          },
          {
            loader: "sass-loader",
            options: { sourceMap: true }
          }
        ]
      }
    ]
  }
});

exports.extractCSS = ({ html }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: "[name].[contenthash:4].css"
  });

  const ignores = [
    //affable atom specific
    /#mainNav.*/,
    // /.+\.testing/,
    ".fadeIn",
    ".fadeOut",
    //bootstrap specific
    /\.alert.*/,
    /\.fade.*/,
    /.*close.*/,
    /.*collaps.*/,
    // /\..*popover.*/,
    // /\..*tooltip.*/,
    /\..*modal.*/,
    // /\.*carousel.*/,
    // /\.active\.carousel.*/,
    // /\.collaps/,
    // /\.fade/,
    /\.show/,
    /(#|\.)navbar(\-[a-zA-Z]+)?/,
    // /(#|\.)dropdown(\-[a-zA-Z]+)?/,
    /(#|\.)(open)/,
    // /.*h\d/,
    /.*valid.*/
  ];

  return {
    module: {
      rules: [
        {
          test: /\.(s*)css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader"
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [
                  require("cssnano"),
                  require("autoprefixer"),
                  require("postcss-uncss")({
                    html,
                    ignore: ignores
                  })
                ]
              }
            },
            { loader: "sass-loader" }
          ]
        }
      ]
    },
    plugins: [plugin]
  };
};

exports.loadImages = ({ options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              // name: "[name].[ext]",
              name: "[name].[hash:4].[ext]",
              limit: 10000
            }
          },
          {
            loader: "img-loader",
            options
          }
        ]
      }
    ]
  }
});

exports.loadJavaScript = ({ include }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
});

exports.minifyJavaScript = () => ({
  optimization: {
    splitChunks: {
      chunks: "initial"
    },
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          warnings: false
        }
      })
    ]
  }
});

exports.analyze = () => ({
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "../bundle-analysis.html",
      openAnalyzer: false
    })
  ]
});
exports.buildPage = (PATHS, isDevelopment) => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: PATHS.app + "/index.ejs",
      filename: "index.html",
      env: {
        Dev: isDevelopment
      }
    }),
    new WebappWebpackPlugin({
      logo: PATHS.app + "/img/logo.svg",
      prefix: ".",
      cache: true,
      favicons: {
        appName: null,
        appDescription: null,
        version: null,
        developerName: null,
        developerURL: null,
        // background: "#000",
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: false,
          coast: false,
          favicons: true,
          firefox: false,
          opengraph: false,
          twitter: false,
          yandex: false,
          windows: false
        }
      }
    })
  ]
});
