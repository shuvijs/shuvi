import path from "path";
import React from "react";
import ReactFS, { File, Dir } from "..";

class App extends React.Component<{}, { createB: boolean }> {
  state = {
    aName: 'dirA',
    a1Name: 'A1',
    createB: false
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState(state => ({
        createB: !state.createB,
        aName: '_dirA',
        a1Name: '_A1'
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

ReactFS.render(<App />, path.join(__dirname, 'test'))

setInterval(() => {
  console.log("keep running");
}, 1000);
