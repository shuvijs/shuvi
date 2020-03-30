class ClassPlugin {
  apply(api) {
    api.__test_class_plugin = true;
  }
}

module.exports = {
  ssr: true,
  plugins: [
    ClassPlugin,
    {
      apply(api) {
        api.__test_object_plugin__ = true;
      }
    }
  ]
};
