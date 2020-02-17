import React from "react";
import FileTemplate from "./FileTemplateFile";
import { BaseComponent } from "./Base";

interface Props {
  module: string;
}

export default class Bootstrap extends BaseComponent<Props> {
  render() {
    const { module } = this.props;
    return (
      <FileTemplate name="bootstrap.js" template={`export * from "${module}"`} />
    );
  }
}
