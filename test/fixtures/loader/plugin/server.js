const { createServerPlugin } = require('shuvi');

module.exports = ({ basename = '' }) =>
  createServerPlugin({
    getAppConfig: ({ req }) => {
      global._req_url = req.url;
      const appConfig = {
        router: {
          basename
        }
      };
      global._app_config = appConfig;
      return appConfig;
    }
  });
