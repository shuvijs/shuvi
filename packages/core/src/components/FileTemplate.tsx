import React from "react";
import { File } from "@shuvi/react-fs";
import fse from "fs-extra";
import Handlebars from "handlebars";
import { memoizeOne } from "../utils";
import { TemplateData } from "../types/file";

export interface Props {
  name: string;
  templateSrc?: string;
  template?: string;
  data?: TemplateData;
}

export default class FileTemplate extends React.Component<Props> {
  private _compileTemplate = memoizeOne((template: string) =>
    Handlebars.compile(template)
  );
  private _readFile = memoizeOne((path: string) =>
    fse.readFileSync(path, "utf8")
  );

  private _renderTemplate(template: string) {
    const templateFn = this._compileTemplate(template);
    const content = templateFn(this.props.data || {});
    return <File name={this.props.name} content={content} />;
  }

  render() {
    const { templateSrc, template } = this.props;

    if (template) {
      return this._renderTemplate(template);
    }

    if (templateSrc) {
      const tmplContent = this._readFile(templateSrc);
      return this._renderTemplate(tmplContent);
    }

    return null;
  }
}
