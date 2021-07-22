import { dynamic } from '@shuvi/services';

const Hello = dynamic(() => import('../components/client-only'), {
  ssr: false
});

export default Hello;
