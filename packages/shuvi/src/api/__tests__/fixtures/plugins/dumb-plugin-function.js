module.exports = api => {
  api.__plugins = api.__plugins || [];
  api.__plugins.push({
    name: 'function-plugin'
  });
};
