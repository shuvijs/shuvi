import { createPlugin } from '../../../../lifecycle';

export default createPlugin({
  afterInit: () => {
    console.log('single-core');
  }
});
