import { dynamic } from '@shuvi/runtime';

const DynamicComponent = dynamic(() => import('../components/hello'));
