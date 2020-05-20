import { dynamic } from '@shuvi/app';

const Hello = dynamic(() => import('../components/Hello'), {
  ssr: false
});

export default () => {
  return (
    <div>
      <div id="page">Page Index</div>
      <Hello />
    </div>
  );
};
