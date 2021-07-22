import { dynamic } from '@shuvi/services';

const Hello = dynamic(() => import('../components/hello'), {
  ssr: false,
  loading: () => <p>LOADING</p>
});

export default Hello;
