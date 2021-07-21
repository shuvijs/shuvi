import dynamic from '@shuvi/app/services/dynamic';

const Hello = dynamic(() => import('../components/hello'));

export default Hello;
