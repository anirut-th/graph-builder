const path = require('path');
const { library } = require('webpack');
module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        filename: 'graph-builder.js',
        path: path.resolve(__dirname, 'build'),
        library: 'GraphBuilder',
        libraryTarget: 'umd',
        environment: {
            arrowFunction: false,
            bigIntLiteral: false
        } 
    },
    module: {
        rules: [{
            test: /\.(js)$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    mode: 'development'
}