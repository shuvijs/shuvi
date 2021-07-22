import { dynamic } from '@shuvi/services';

const Hello = dynamic(() => import('../components/hello'));

export default Hello;
