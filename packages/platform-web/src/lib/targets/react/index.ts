import { createCliPlugin } from '@shuvi/service';
import bundlerPlugin from './bundler';
import { resolveAppFile, resolveDep, resolveLib } from '../../paths';

const webReactMainPlugin = createCliPlugin({
  platformModule: () => resolveAppFile('react/index'),
  appPolyfill: () => [
    resolveDep('react-app-polyfill/ie11'),
    resolveDep('react-app-polyfill/stable')
  ],
  appExport: () => [
    {
      source: resolveAppFile('react/App'),
      exported: '{ default as App }'
    },
    {
      source: resolveAppFile('react/head/head'),
      exported: '{ default as Head }'
    },
    {
      source: resolveAppFile('react/dynamic'),
      exported: '{ default as dynamic }'
    },
    {
      source: resolveLib('@shuvi/router-react'),
      exported:
        '{ useParams, useRouter, useCurrentRoute, Link, RouterView, withRouter }'
    }
  ]
});

export default () => [webReactMainPlugin, bundlerPlugin];
