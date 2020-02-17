import { BaseComponent } from "./base";
import { FileNode as IFileNode } from "../models/files";
interface Props {
    file: IFileNode;
}
export default class FileNode extends BaseComponent<Props> {
    constructor(props: Props);
    private _renderFile;
    private _renderDir;
    private _renderNode;
    render(): JSX.Element | null;
}
export {};
