import { Component } from "react";
import { Runtime } from "@shuvi/core";
import { DocumentContextType } from "../helper/documentContext";
export default class Document extends Component<Runtime.DocumentProps> {
    context: DocumentContextType;
    getContextValue(): DocumentContextType;
    render(): JSX.Element;
}
