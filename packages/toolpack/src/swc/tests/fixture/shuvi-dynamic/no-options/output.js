import { dynamic } from '@shuvi/app';
const DynamicComponent = dynamic(() => import('../components/hello'), {
  webpack: () => [require.resolveWeak('../components/hello')],
  modules: ['../components/hello']
});
