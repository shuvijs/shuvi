const { createServerPlugin } = require('shuvi');

module.exports = () =>
  createServerPlugin({
    getAppConfig: ({ req }) => {
      global._req_url = req.url;

      /**
       * For the purpose of testing, get the basename from the request header.
       * For the concurrent requests, basename should not be shared.
       */
      const basename = req.headers['__shuvi-basename'] || '';
      const appConfig = {
        router: {
          basename
        }
      };

      global._app_config = appConfig;
      return appConfig;
    }
  });
