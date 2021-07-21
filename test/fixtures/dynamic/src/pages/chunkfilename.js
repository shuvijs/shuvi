import dynamic from '@shuvi/app/services/dynamic';

const Hello = dynamic(() =>
  import(
    /* webpackChunkName: 'hello-world' */ '../components/hello-chunkfilename'
  )
);

export default Hello;
