import { dynamic } from '@shuvi/runtime';
import { View } from '@tarojs/components';

const BrowserLoaded = dynamic(
  async () => () => <View id="BrowserLoaded">Browser hydrated</View>,
  {
    ssr: false
  }
);

export default () => (
  <View>
    <View>Nested 2</View>
    <BrowserLoaded />
  </View>
);
