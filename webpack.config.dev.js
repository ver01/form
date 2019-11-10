var path = require("path");
var webpack = require("webpack");
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    mode: "development",
    devtool: "eval",
    entry: ["webpack-hot-middleware/client?reload=true", "./playground/app"],
    output: {
        path: path.join(__dirname, "build"),
        filename: "bundle.js",
        publicPath: "/static/",
    },
    plugins: [new webpack.HotModuleReplacementPlugin(), new BundleAnalyzerPlugin()],
    externals: [
        {
            react: "React",
            "react-dom": "ReactDOM",
            codemirror: "CodeMirror",
        },
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ["babel-loader"],
                include: [
                    path.join(__dirname, "src"),
                    path.join(__dirname, "playground"),
                    path.join(__dirname, "node_modules", "codemirror", "mode", "javascript"),
                ],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                include: [
                    path.join(__dirname, "css"),
                    path.join(__dirname, "playground"),
                    path.join(__dirname, "node_modules"),
                ],
            },
        ],
    },
};
