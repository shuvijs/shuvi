const isDev = process.env.NODE_ENV === 'development';

export default {
  ssr: true,
  plugins: [
    {
      configWebpack: (config, { name, webpack }) => {
        config.plugin('app/webpack-define-plugin').use(webpack.DefinePlugin, [
          {
            __NAME__: JSON.stringify(name),
            __DEV__: isDev
          }
        ]);
        return config;
      }
    }
  ]
};
