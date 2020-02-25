import React from "react";
import { File } from "@shuvi/react-fs";
import fse from "fs-extra";
import Handlebars from "handlebars";
import { TemplateData } from "../models/files";
import { memoizeOne } from "../utils";
import { BaseComponent } from "./Base";

export interface Props {
  name: string;
  file?: string;
  content?: string;
  data?: TemplateData;
}

export default class FileTemplate extends BaseComponent<Props> {
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
    const { file, content } = this.props;
    if (content) {
      return this._renderTemplate(content);
    }

    if (file) {
      const tmplContent = this._readFile(file);
      return this._renderTemplate(tmplContent);
    }

    return null;
  }
}
