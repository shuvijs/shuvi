import { dynamic } from '@shuvi/runtime';

const Hello = dynamic({
  loader: () => import('../../components/hello')
});

export default Hello;
