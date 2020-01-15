import React from "react";

let DISABLE_LIFECYCLE: boolean = false;

export function swtichOffLifeCycle() {
  DISABLE_LIFECYCLE = true;
}

export function swtichOnLifeCycle() {
  DISABLE_LIFECYCLE = false;
}

export class BaseComponent<P = {}, S = {}> extends React.Component<P, S> {
  constructor(props: P) {
    super(props);

    if (DISABLE_LIFECYCLE) {
      this.componentDidCatch = undefined;
      this.componentDidMount = undefined;
      this.componentDidUpdate = undefined;
      this.componentWillMount = undefined;
      this.componentWillReceiveProps = undefined;
      this.componentWillUnmount = undefined;
      this.componentWillUpdate = undefined;
      this.getSnapshotBeforeUpdate = undefined;
      this.UNSAFE_componentWillMount = undefined;
      this.UNSAFE_componentWillReceiveProps = undefined;
      this.UNSAFE_componentWillUpdate = undefined;
      this.shouldComponentUpdate = () => false;
      this.setState = newState => {
        if (typeof newState === "function") {
          newState = (newState as any)(this.state, this.props, this.context);
        }
        this.state = Object.assign({}, this.state, newState);
      };
    }
  }
}
