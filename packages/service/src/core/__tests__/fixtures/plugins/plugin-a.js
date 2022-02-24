import { createPlugin } from '../../../lifecycle';

export default createPlugin(
  {
    afterInit: () => {}
  },
  { name: 'a' }
);
