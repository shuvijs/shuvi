import { dynamic } from '@shuvi/services';

const DynamicComponent = dynamic(() => import('../components/nested1'));

export default DynamicComponent;
