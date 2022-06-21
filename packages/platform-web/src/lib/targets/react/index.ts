import { createPlugin } from '@shuvi/service';
import bundlerPlugin from './bundler';
import { resolveAppFile, resolveDep, resolveLib } from '../../paths';

const webReactMainPlugin = createPlugin({
  addRuntimeService: () => [
    {
      source: resolveAppFile('react/head/head'),
      exported: '{ default as Head }'
    },
    {
      source: resolveAppFile('react/dynamic'),
      exported: '{ default as dynamic }'
    },
    {
      source: resolveAppFile('react/loader'),
      exported: '{ useLoaderData }'
    },
    // typescript type cannot be exported at js file so put it at `index.d.ts`
    {
      source: resolveAppFile('react/loader'),
      exported: '{ Loader }',
      filepath: 'index.d.ts'
    },
    {
      source: resolveLib('@shuvi/router-react'),
      exported: '{ useParams, useRouter, useCurrentRoute, Link, RouterView }'
    }
  ]
});
const platformWebReact = () => {
  return {
    plugins: [webReactMainPlugin, bundlerPlugin],
    platformModule: resolveAppFile('react/index'),
    polyfills: [
      resolveDep('react-app-polyfill/ie11'),
      resolveDep('react-app-polyfill/stable')
    ]
  };
};

export default platformWebReact;
