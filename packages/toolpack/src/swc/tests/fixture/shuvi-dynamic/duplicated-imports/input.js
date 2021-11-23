import { dynamic } from '@shuvi/app';

const DynamicComponent1 = dynamic(() => import('../components/hello1'));
const DynamicComponent2 = dynamic(() => import('../components/hello2'));
