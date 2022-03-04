const { name } = require('./package');
// const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
    config.output.globalObject = 'window';
    config.stats = {
      errorDetails: true, // --display-error-details
    }
    // config.plugins = [
    //   ...config.plugins,
    //   new NodePolyfillPlugin()
    // ]
    return config;
  },

  devServer: (_) => {
    const config = _;

    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    config.historyApiFallback = true;
    config.hot = false;
    config.liveReload = false;
    config.open = false

    return config;
  }
};