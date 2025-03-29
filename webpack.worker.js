const path = require('path');

module.exports = {
  entry: './src/worker/index.ts',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  mode: process.env.NODE_ENV || 'production',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "http": false,
      "https": false,
      "url": false,
      "util": false,
      "buffer": false,
      "stream": false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
}; 