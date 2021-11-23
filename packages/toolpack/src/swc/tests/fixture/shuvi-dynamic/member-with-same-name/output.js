import { dynamic } from '@shuvi/app';
import somethingElse from 'something-else';
const DynamicComponent = dynamic(() => import('../components/hello'), {
  webpack: () => [require.resolveWeak('../components/hello')],
  modules: ['../components/hello']
});
somethingElse.dynamic('should not be transformed');
