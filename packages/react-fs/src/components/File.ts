import { createElement, Component } from "react";
import { FileProps } from "../types";

export default class File extends Component<FileProps> {
  shouldComponentUpdate(nextProps: FileProps) {
    return (
      nextProps.name !== this.props.name ||
      nextProps.content !== this.props.content
    );
  }

  render() {
    return createElement<FileProps>("file", this.props);
  }
}
