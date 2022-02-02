//
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

exports.clean = (path) => ({
  plugins: [new CleanWebpackPlugin()],
});

exports.devServer = ({ host, port, PATHS } = {}) => ({
  devServer: {
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    watchFiles: PATHS.app + "/index.html",
    open: {
      app: {
        name: "Google Chrome",
      },
    },
    client: {
      progress: true,
      overlay: {
        warnings: true,
        errors: true,
      },
    },
  },
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
            options: { sourceMap: true },
          },
          {
            loader: "sass-loader",
            options: { sourceMap: true },
          },
        ],
      },
    ],
  },
});

exports.extractCSS = () => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: "[name].[contenthash:4].css",
  });

  return {
    module: {
      rules: [
        {
          test: /\.(s*)css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: { plugins: [require("autoprefixer")] },
              },
            },
            { loader: "sass-loader" },
          ],
        },
      ],
    },
    plugins: [plugin],
  };
};

exports.loadImages = ({ limit, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
        parser: { dataUrlCondition: { maxSize: limit } },
        use: [
          {
            loader: "img-loader",
            options
          }
        ]
      },
    ],
  },
});

exports.buildPage = (PATHS, isDevelopment) => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: PATHS.app + "/index.html",
      filename: "index.html"
    }),
    new FaviconsWebpackPlugin({
      logo: PATHS.app + "/img/FustusBunyun_icon.png",
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
          windows: false,
        },
      },
    }),
  ],
});

exports.cpNetlify = (PATHS) => ({
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: PATHS.app + "/netlify", to: PATHS.build },
      ]
    }),
  ],
});