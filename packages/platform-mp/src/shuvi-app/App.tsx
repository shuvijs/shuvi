// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, PropsWithChildren } from 'react';

class App extends Component<PropsWithChildren<{}>> {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children;
  }
}

export default App;
