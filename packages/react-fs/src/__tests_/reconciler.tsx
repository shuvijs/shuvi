import path from "path";
import React from "react";
import ReactFS from "..";

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
        <dir name={this.state.aName}>
          <file name={this.state.a1Name} content="s" />
          <dir name="dirA_A">
            <file name="A_A1" content="s" />
          </dir>
        </dir>
        {this.state.createB && <dir name="dirB" />}
      </>
    );
  }
}

ReactFS.render(<App />, path.join(__dirname, 'test'))

setInterval(() => {
  console.log("keep running");
}, 1000);
