const { createPlugin } = require('shuvi');

module.exports = createPlugin({
  afterInit: () => {
    console.warn('afterInit');
  },
  afterBuild: () => {
    console.warn('afterBuild');
  },
  afterBundlerDone: () => {
    console.warn('bundlerDone');
  },
  afterBundlerTargetDone: () => {
    console.warn('bundlerTargetDone');
  }
});
