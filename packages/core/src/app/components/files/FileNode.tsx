import React from "react";
import { Dir as DirComp } from "@shuvi/react-fs";
import { IFileNode, File, Dir, isDir, isFile } from "../../models/files";

interface Props {
  file: IFileNode;
}

export default class FileNode extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this._renderNode = this._renderNode.bind(this);
    this._renderFile = this._renderFile.bind(this);
  }

  private _renderFile(file: File) {
    const { name, type: Comp, props } = file;
    return <Comp key={name} {...props} name={name} />;
  }

  private _renderDir(dir: Dir) {
    return (
      <DirComp key={dir.name} name={dir.name}>
        {dir.children?.map(node => this._renderNode(node))}
      </DirComp>
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
