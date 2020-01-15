import { FileNode as FileNodeSpec } from "../types/file";
import { BaseComponent } from "./base";
interface Props {
    file: FileNodeSpec;
}
export default class FileNode extends BaseComponent<Props> {
    constructor(props: Props);
    private _renderFile;
    private _renderDir;
    private _renderNode;
    render(): JSX.Element | null;
}
export {};
