const isDev = process.env.NODE_ENV === 'development';
const { ModuleFederationPlugin } = require('webpack').container;
const { BUNDLER_TARGET_SERVER } = require('shuvi');
const path = require('path');
const sharedDeps = require('../sharedDeps');
const fixChunk = require('../fixChunk');

const nextServerRemote = remoteObject => {
  if (typeof remoteObject !== 'object') {
    throw new Error('Remotes must be configured as an object');
  }
  const result = Object.entries(remoteObject).reduce((acc, [name, config]) => {
    acc[name] = {
      external: `external new Promise(res => {
        let remote
        try {
        remote = require('${config}')['${name}']
        } catch (e) {
        delete require.cache['${config}']
        remote = require('${config}')['${name}']
        }
        const proxy = {get:(request)=> remote.get(request),init:(arg)=>{try {return remote.init(arg)} catch(e){console.log('remote container already initialized')}}}
        res(proxy)
        })`
    };
    return acc;
  }, {});
  return result;
};

module.exports = {
  ssr: true,
  plugins: [
    api => {
      api.tap('app:entryFileContent', {
        fn: name => {
          return `import ('${api.resolveAppFile('bootstrap')}');`;
        }
      });
      api.tap('bundler:configTarget', {
        fn: (config, { name }) => {
          const isServer = name === BUNDLER_TARGET_SERVER;
          if (isServer) {
          } else {
            fixChunk(config);
          }

          config.plugin('module-federation').use(ModuleFederationPlugin, [
            {
              name: 'mfeBBB',
              remotes: isServer
                ? nextServerRemote({
                    mfeAAA: path.resolve(
                      __dirname,
                      '../module-federation-a/dist/server/remoteEntry.js'
                    )
                  })
                : {
                    mfeAAA: 'mfeAAA'
                  },
              remoteType: 'var',
              shared: sharedDeps
            }
          ]);

          return config;
        }
      });

      api.tap('modifyHtml', {
        name: 'injectMF',
        fn: documentProps => {
          const tags = ['http://localhost:8080/_shuvi/remoteEntry.js'].map(
            remote => ({
              tagName: 'script',
              attrs: {
                src: remote
              }
            })
          );

          documentProps.scriptTags.push(tags[0]);
          return documentProps;
        }
      });
    }
  ]
};
