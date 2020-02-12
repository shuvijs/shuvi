import React from "react";
import { DirProps } from "../internal";

export default class Dir extends React.PureComponent<DirProps> {
  render() {
    return React.createElement<DirProps>("dir", this.props);
  }
}
