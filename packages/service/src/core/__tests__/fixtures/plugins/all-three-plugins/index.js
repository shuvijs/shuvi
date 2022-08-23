import { createPlugin } from '../../../../plugin';

export default createPlugin({
  afterInit: () => {
    console.log('all-three-plugins-core');
  }
});
