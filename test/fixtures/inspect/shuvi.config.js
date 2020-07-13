const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  ssr: true,
  plugins: [
    api => {
      api.tap('bundler:configTarget', {
        fn: (config, { name, webpack }) => {
          config.plugin('app/webpack-define-plugin').use(webpack.DefinePlugin, [
            {
              __NAME__: JSON.stringify(name),
              __DEV__: isDev
            }
          ]);
          return config;
        }
      });
    }
  ]
};
