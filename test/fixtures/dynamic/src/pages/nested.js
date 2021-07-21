import dynamic from '@shuvi/app/services/dynamic';

const DynamicComponent = dynamic(() => import('../components/nested1'));

export default DynamicComponent;
