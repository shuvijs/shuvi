import React from "react";
import { File } from "@shuvi/react-fs";
import fse from "fs-extra";
import Handlebars from "handlebars";
import { memoizeOne } from "../utils";
import { TemplateData } from "../types/file";
import { BaseComponent } from "./Base";

export interface Props {
  name: string;
  templateFile?: string;
  template?: string;
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
    const { templateFile, template } = this.props;
    if (template) {
      return this._renderTemplate(template);
    }

    if (templateFile) {
      const tmplContent = this._readFile(templateFile);
      return this._renderTemplate(tmplContent);
    }

    return null;
  }
}
