import dynamic from '@shuvi/app/services/dynamic';

const Hello = dynamic(() => import('../components/hello'), {
  ssr: false,
  loading: () => <p>LOADING</p>
});

export default Hello;
