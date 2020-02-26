import React from "react";
import { Dir, File } from "@shuvi/react-fs";
import FileTemplate from "./FileTemplateFile";
import FileSelector from "./FilePriorityFile";
import { BaseComponent } from "./base";
import {
  FileNode as IFileNode,
  File as IFile,
  Dir as IDir,
  isDir,
  isTemplateFile,
  isPriorityFile,
  isFile
} from "../models/files";

interface Props {
  file: IFileNode;
}

export default class FileNode extends BaseComponent<Props> {
  constructor(props: Props) {
    super(props);

    this._renderNode = this._renderNode.bind(this);
    this._renderFile = this._renderFile.bind(this);
  }

  private _renderFile(file: IFile) {
    let Comp: React.ComponentType<any>;
    if (isTemplateFile(file)) {
      Comp = FileTemplate;
    } else if (isPriorityFile(file)) {
      Comp = FileSelector;
    } else {
      Comp = File;
    }

    return <Comp {...file} />;
  }

  private _renderDir(dir: IDir) {
    return (
      <Dir name={dir.name}>
        {dir.children?.map(node => this._renderNode(node))}
      </Dir>
    );
  }

  private _renderNode(node: IFileNode) {
    if (isDir(node)) {
      return this._renderDir(node);
    } else if (isFile(node)) {
      return this._renderFile(node);
    }

    return null;
  }

  render() {
    return this._renderNode(this.props.file);
  }
}
