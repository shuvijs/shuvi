import { Component } from "react";
import * as Runtime from "@shuvi/types/runtime";
import { DocumentContextType } from "../../documentContext";
export default class Document extends Component<Runtime.DocumentProps> {
    context: DocumentContextType;
    getContextValue(): DocumentContextType;
    render(): JSX.Element;
}
