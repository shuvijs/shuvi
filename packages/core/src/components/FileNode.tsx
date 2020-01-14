import React from "react";
import { Dir as CompDir } from "@shuvi/react-fs";
import {
  File as FileSpec,
  Dir as DirSpec,
  FileNode as FileNodeSpec
} from "../types/file";
import FileTemplate from "./FileTemplate";
import FileSelector from "./FileSelector";

interface Props {
  file: FileNodeSpec;
}

export default class FileNode extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this._renderNode = this._renderNode.bind(this);
    this._renderFile = this._renderFile.bind(this);
  }

  private _renderFile(file: FileSpec) {
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
        return null;
    }

    return <Comp {...props} />;
  }

  private _renderDir(dir: DirSpec) {
    return (
      <CompDir name={dir.name}>
        {dir.children?.map(node => this._renderNode(node))}
      </CompDir>
    );
  }

  private _renderNode(node: FileNodeSpec) {
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
