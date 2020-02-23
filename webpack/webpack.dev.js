const merge = require('webpack-merge'); // eslint-disable-line
const common = require('./webpack.common.js'); // eslint-disable-line
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // eslint-disable-line

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [new BundleAnalyzerPlugin()],
});
