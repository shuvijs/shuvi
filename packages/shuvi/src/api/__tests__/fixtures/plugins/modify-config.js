module.exports = class Plugin {
  constructor(options) {
    this.options = options;
    this.name = 'modify-config';
  }

  modifyConfig(config) {
    config.publicPath = '/bar';
    return config;
  }

  apply(api) {
    api.__plugins = api.__plugins || [];
    api.__plugins.push(this);
  }
};
