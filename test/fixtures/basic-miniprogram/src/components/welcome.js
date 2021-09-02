import React from 'react';
import { View } from '@tarojs/components';

export default class Welcome extends React.Component {
  state = { name: null };

  componentDidMount() {
    const { name } = this.props;
    this.setState({ name });
  }

  render() {
    const { name } = this.state;
    if (!name) return null;

    return <View>Welcome, {name}</View>;
  }
}
