const { createServerPlugin } = require('shuvi');

module.exports = (options = { disableBasename: false }) =>
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
          basename: options.disableBasename ? null : basename
        }
      };

      global._app_config = appConfig;
      return appConfig;
    }
  });
