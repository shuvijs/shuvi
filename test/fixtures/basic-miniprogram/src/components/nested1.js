import { dynamic } from '@shuvi/runtime';
import { View } from '@tarojs/components';

const Nested2 = dynamic(() => import('./nested2'));

export default () => (
  <View>
    Nested 1
    <Nested2 />
  </View>
);
