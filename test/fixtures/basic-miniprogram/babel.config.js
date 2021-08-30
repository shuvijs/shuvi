// babel-preset-taro
// for more options and default values:
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    [
      '@binance/babel-preset-bmp',
      {
        framework: 'react',
        ts: true
      }
    ]
  ]
};
