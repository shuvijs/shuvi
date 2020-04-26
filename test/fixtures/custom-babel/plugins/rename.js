module.exports = function plugin(babel) {
  return {
    visitor: {
      VariableDeclarator(path, { opts }) {
        const node = path.get('id').node;
        if (node.name === opts.from) {
          node.name = opts.to;
        }
      }
    }
  };
};
