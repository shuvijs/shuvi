import { dynamic } from '@shuvi/runtime';

const DisableShuviDynamic = dynamic(() => import('../../components/hello'), {
  ssr: false
});

export default DisableShuviDynamic;
