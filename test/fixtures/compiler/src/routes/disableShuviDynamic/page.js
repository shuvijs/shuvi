import { dynamic } from '@shuvi/runtime';

const DisableShuviDynamic = dynamic(
  async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 5 * 1000);
    });
    return import('../../components/hello');
  },
  {
    ssr: false
  }
);

export default DisableShuviDynamic;
