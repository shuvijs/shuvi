import { dynamic } from '@shuvi/runtime';
import somethingElse from 'something-else';

const DynamicComponent = dynamic(() => import('../components/hello'));
somethingElse.dynamic('should not be transformed');
