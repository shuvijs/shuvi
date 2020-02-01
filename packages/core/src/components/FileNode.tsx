import React from "react";
import { Dir, File } from "@shuvi/react-fs";
import {
  File as IFile,
  Dir as IDir,
  FileNode as IFileNode
} from "@shuvi/types/core";
import FileTemplate from "./FileTemplate";
import FileSelector from "./FileSelector";
import { BaseComponent } from "./base";

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
    const { type, ...props } = file;
    let Comp: React.ComponentType<any>;
    switch (type) {
      case "template":
        Comp = FileTemplate;
        break;
      case "selector":
        Comp = FileSelector;
        break;
      default:
        Comp = File;
    }

    return <Comp {...props} />;
  }

  private _renderDir(dir: IDir) {
    return (
      <Dir name={dir.name}>
        {dir.children?.map(node => this._renderNode(node))}
      </Dir>
    );
  }

  private _renderNode(node: IFileNode) {
    if (node.$$type === "dir") {
      return this._renderDir(node);
    } else if (node.$$type === "file") {
      return this._renderFile(node);
    }

    return null;
  }

  render() {
    return this._renderNode(this.props.file);
  }
}
