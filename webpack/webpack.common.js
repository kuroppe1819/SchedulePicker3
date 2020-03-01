const path = require('path'); // eslint-disable-line
const CopyPlugin = require('copy-webpack-plugin'); // eslint-disable-line
const webpack = require('webpack') // eslint-disable-line
const EncodingPlugin = require('webpack-encoding-plugin');
const srcDir = '../src/';

module.exports = {
    entry: {
        popup: path.join(__dirname, `${srcDir}popup/index.tsx`),
        calendar: path.join(__dirname, `${srcDir}calendar/index.tsx`),
        initialize: path.join(__dirname, `${srcDir}background/initialize.ts`),
        userinput: path.join(__dirname, `${srcDir}background/userinput.ts`),
        contentscript: path.join(__dirname, `${srcDir}content/contentscript.ts`),
    },
    output: {
        path: path.join(__dirname, '../dist/js'),
        filename: '[name].js',
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: 'initial',
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new CopyPlugin([{ from: '.', to: '../' }], { context: 'public' }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new EncodingPlugin({
            encoding: 'UTF-8',
        }),
    ],
};
