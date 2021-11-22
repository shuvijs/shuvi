import { dynamic } from '@shuvi/app';

const DynamicComponent1 = dynamic(() => import('../components/hello1'), {
  webpack: () => [require.resolve('../components/hello1')],
  modules: ['../components/hello1']
});
const DynamicComponent2 = dynamic(() => import('../components/hello2'), {
  webpack: () => [require.resolve('../components/hello2')],
  modules: ['../components/hello2']
});
