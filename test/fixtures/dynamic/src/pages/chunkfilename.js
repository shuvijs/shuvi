import { dynamic } from '@shuvi/services';

const Hello = dynamic(() =>
  import(
    /* webpackChunkName: 'hello-world' */ '../components/hello-chunkfilename'
  )
);

export default Hello;
