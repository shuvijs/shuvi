import { createPlugin } from '../../../../lifecycle';

export default createPlugin({
  afterInit: () => {
    console.log('all-three-plugins-core');
  }
});
