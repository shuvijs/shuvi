import { TemplateData } from "../types/file";
import { BaseComponent } from "./Base";
export interface Props {
    name: string;
    templateSrc?: string;
    template?: string;
    data?: TemplateData;
}
export default class FileTemplate extends BaseComponent<Props> {
    private _compileTemplate;
    private _readFile;
    private _renderTemplate;
    render(): JSX.Element | null;
}
