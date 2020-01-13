import React from "react";
import { FileNode as FileNodeSpec } from "../types/file";
interface Props {
    file: FileNodeSpec;
}
export default class FileNode extends React.Component<Props> {
    constructor(props: Props);
    private _renderFile;
    private _renderDir;
    private _renderNode;
    render(): JSX.Element | null;
}
export {};
