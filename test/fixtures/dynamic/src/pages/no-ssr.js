import dynamic from '@shuvi/app/services/dynamic';

const Hello = dynamic(() => import('../components/client-only'), {
  ssr: false
});

export default Hello;
