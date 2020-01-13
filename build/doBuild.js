let webpack = require("webpack");
let  path = require("path");

const webpackCfg = {
    entry: "./src/wzwTetirs.js",
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'wzwTetirs.min.js'
    },
    mode: 'production'
};

console.log("开始...");
webpack(webpackCfg, function (er, stats) {
    if (er) {
        console.log("出错了：", er);
    }  else {
        console.log("完成:", stats.toString());
    }
});