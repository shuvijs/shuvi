module.exports = (api, options) => {
  api.__presets = api.__presets || [];
  api.__presets.push({
    name: 'simple-preset',
    options
  });

  return {
    presets: [],
    plugins: []
  };
};
