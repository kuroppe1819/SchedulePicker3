const merge = require('webpack-merge'); // eslint-disable-line
const common = require('./webpack.common.js'); // eslint-disable-line

module.exports = merge(common, {
    mode: 'production',
    performance: {
        maxAssetSize: 10000000,
        maxEntrypointSize: 1000000,
    },
});
