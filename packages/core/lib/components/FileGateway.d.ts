import React from "react";
export interface Props {
    name: string;
    files: [string, string, ...string[]];
}
interface State {
    file: string;
}
export default class TemplateFile extends React.Component<Props, State> {
    constructor(props: Props);
    render(): JSX.Element;
}
export {};
