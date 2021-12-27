module.exports = (context, options) => {
  console.log('context', context);
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
