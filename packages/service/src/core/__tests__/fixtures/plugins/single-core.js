import { createPlugin } from '../../../plugin';

export default createPlugin({
  afterInit: () => {
    console.log('single-core');
  }
});
