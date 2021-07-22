import { dynamic } from '@shuvi/services';

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
