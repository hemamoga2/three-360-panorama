module.exports = {
  entry: './src/js/index.js',
  output: {
    path: __dirname,
    filename: './dist/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};