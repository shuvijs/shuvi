import { dynamic } from '@shuvi/app';

const DynamicComponent = dynamic(() => import('../components/hello'));
