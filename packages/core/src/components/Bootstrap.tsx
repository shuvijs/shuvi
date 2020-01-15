import React from "react";
import FileTemplate from "./FileTemplate";
import { BaseComponent } from "./Base";

interface Props {
  src: string;
}

export default class Bootstrap extends BaseComponent<Props> {
  render() {
    const { src } = this.props;
    return <FileTemplate name="bootstrap.js" templateSrc={src} />;
  }
}
