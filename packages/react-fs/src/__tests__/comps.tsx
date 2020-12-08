import { Component } from "react";
import { File, Dir } from "..";

export class Test1 extends Component<{}, { createB: boolean }> {
  state = {
    aName: "dirA",
    a1Name: "A1",
    createB: false
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState(state => ({
        createB: !state.createB,
        aName: "_dirA",
        a1Name: "_A1"
      }));
    }, 10 * 1000);
  }

  render() {
    return (
      <>
        <Dir name={this.state.aName}>
          <File name={this.state.a1Name} content="s" />
          <Dir name="dirA_A">
            <File name="A_A1" content="s" />
          </Dir>
        </Dir>
        {this.state.createB && <Dir name="dirB" />}
      </>
    );
  }
}
