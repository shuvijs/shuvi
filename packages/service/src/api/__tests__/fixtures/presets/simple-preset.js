module.exports = (context, options) => {
  context.__presets = context.__presets || [];
  context.__presets.push({
    name: 'simple-preset',
    options
  });

  return {
    presets: [],
    plugins: []
  };
};
