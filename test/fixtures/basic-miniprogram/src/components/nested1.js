import { dynamic } from '@shuvi/app';
import { View } from '@tarojs/components';

const Nested2 = dynamic(() => import('./nested2'));

export default () => (
  <View>
    Nested 1
    <Nested2 />
  </View>
);
