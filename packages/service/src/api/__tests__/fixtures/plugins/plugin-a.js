module.exports = class Plugin {
  constructor(options) {
    this.options = options;
    this.name = 'a';
  }

  apply(api) {
    api.__plugins = api.__plugins || [];
    api.__plugins.push(this);
  }
};
