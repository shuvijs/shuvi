// Based on https://github.com/zeit/next.js
// License: https://github.com/zeit/next.js/blob/977bf8d9ebd2845241b8689317f36e4e487f39d0/license.md

import * as React from 'react';
import { SideEffectProps, HeadState } from './types';

const isServer = typeof window === 'undefined';

export default () => {
  const mountedInstances: Set<any> = new Set();
  let state: HeadState | undefined;

  function emitChange(component: React.Component<SideEffectProps>) {
    state = component.props.reduceComponentsToState(
      [...mountedInstances],
      component.props
    );
    if (component.props.handleStateChange) {
      component.props.handleStateChange(state);
    }
  }

  return class extends React.Component<SideEffectProps> {
    // Used when server rendering
    static rewind() {
      const recordedState = state;
      state = undefined;
      mountedInstances.clear();
      return recordedState;
    }

    constructor(props: any) {
      super(props);
      if (isServer) {
        mountedInstances.add(this);
        emitChange(this);
      }
    }
    componentDidMount() {
      mountedInstances.add(this);
      emitChange(this);
    }
    componentDidUpdate() {
      emitChange(this);
    }
    componentWillUnmount() {
      mountedInstances.delete(this);
      emitChange(this);
    }

    render() {
      return null;
    }
  };
};
