const path = require("path");

module.exports = {
  ssr: true,
  plugins: [
    {
      apply(api) {
        api.tap("bundler:config", {
          name: "test",
          fn(config) {
            config.module
              .rule("hrm")
              .test(/pages[\\/]hmr[\\/]about/)
              .use("warning-loader")
              .loader(path.join(__dirname, "warning-loader.js"));
            return config;
          }
        });
      }
    }
  ]
};
