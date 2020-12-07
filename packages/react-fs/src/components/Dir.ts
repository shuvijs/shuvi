import { createElement, PureComponent } from "react";
import { DirProps } from "../types";

export default class Dir extends PureComponent<DirProps> {
  render() {
    return createElement<DirProps>("dir", this.props);
  }
}
