import { Component } from 'react';

export default class Welcome extends Component {
  state = { name: null }

  componentDidMount() {
    const { name } = this.props
    this.setState({ name })
  }

  render() {
    const { name } = this.state
    if (!name) return null

    return <p>Welcome, {name}</p>
  }
}
