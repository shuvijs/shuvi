import { dynamic } from '@shuvi/runtime';

const DynamicComponent = dynamic(() => import('../../components/nested1'));

export default DynamicComponent;
