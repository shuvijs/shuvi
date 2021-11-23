import { dynamic } from '@shuvi/app';
const DynamicComponent = dynamic(() => import('../components/hello'), {
  webpack: () => [require.resolve('../components/hello')],
  modules: ['../components/hello']
});
