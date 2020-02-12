import React from "react";
import { FileProps } from "../internal";

export default class File extends React.Component<FileProps> {
  shouldComponentUpdate(nextProps: FileProps) {
    return (
      nextProps.name !== this.props.name ||
      nextProps.content !== this.props.content
    );
  }

  render() {
    return React.createElement<FileProps>("file", this.props);
  }
}
