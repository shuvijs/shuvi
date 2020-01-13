import React from "react";
import { TemplateData } from "../types/file";
export interface Props {
    name: string;
    templateSrc?: string;
    template?: string;
    data?: TemplateData;
}
export default class TemplateFile extends React.Component<Props> {
    private _compileTemplate;
    private _readFile;
    private _renderTemplate;
    render(): JSX.Element | null;
}
