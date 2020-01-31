import React from "react";
import FileTemplate from "./FileTemplate";
import { BaseComponent } from "./Base";

interface Props {
  file: string;
}

export default class Bootstrap extends BaseComponent<Props> {
  render() {
    const { file } = this.props;
    return <FileTemplate name="bootstrap.js" templateFile={file} />;
  }
}
