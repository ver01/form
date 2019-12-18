const path = require("path");
const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
    mode: "production",
    cache: true,
    context: __dirname + "/src",
    entry: "./index.js",
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "index.js",
        libraryTarget: "umd",
    },
    plugins: [
        new LodashModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: "production",
            },
        }),
        // new BundleAnalyzerPlugin(),
    ],
    devtool: "source-map",
    externals: {
        react: {
            root: "React",
            commonjs: "react",
            commonjs2: "react",
            amd: "react",
            umd: "react",
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")],
    },
};
