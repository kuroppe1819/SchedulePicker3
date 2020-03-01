const merge = require('webpack-merge'); // eslint-disable-line
const common = require('./webpack.common.js'); // eslint-disable-line

module.exports = merge(common, {
    devtool: 'cheap-module-source-map',
    mode: 'development', // FIXME: productionに設定するとvender.jsがUTF-8でエンコーディングされなくて拡張機能が読み込めないので development でビルドする
    performance: {
        maxAssetSize: 10000000,
        maxEntrypointSize: 1000000,
    },
});
