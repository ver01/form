var path = require("path");
var webpack = require("webpack");

module.exports = {
    mode: "production",
    cache: true,
    context: __dirname + "/src",
    entry: "./index.js",
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "ver01-form.js",
        library: "V01Form",
        libraryTarget: "umd",
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production"),
            },
        }),
    ],
    devtool: "source-map",
    externals: {
        react: {
            root: "React",
            commonjs: "react",
            commonjs2: "react",
            amd: "react",
        },
        "react-dom": {
            root: "ReactDOM",
            commonjs2: "react-dom",
            commonjs: "react-dom",
            amd: "react-dom",
            umd: "react-dom",
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["babel-loader"],
                exclude: [
                    path.join(__dirname, "node_modules", "core-js"),
                    path.join(__dirname, "node_modules", "babel-runtime"),
                ],
            },
        ],
    },
};