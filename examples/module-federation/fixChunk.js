module.exports = chain => {
  chain.optimization.merge({
    splitChunks: {
      cacheGroups: {
        commons: false,
        shared: false
      }
    }
  });
  return chain;
};
