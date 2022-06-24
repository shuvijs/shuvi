import { dynamic } from '@shuvi/runtime';

const Hello = dynamic(() => import('../../components/hello'));

export default Hello;
