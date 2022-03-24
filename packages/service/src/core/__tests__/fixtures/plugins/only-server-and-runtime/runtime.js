import { createPlugin } from '../../../utils';

export default createPlugin({
  test: () => {
    console.log('all-three-plugins-runtime');
  }
});
