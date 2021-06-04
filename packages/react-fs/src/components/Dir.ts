import React from "react";
import { DirProps } from "../types";

export default class Dir extends React.PureComponent<DirProps> {
  render() {
    return React.createElement<DirProps>("dir", this.props);
  }
}
