import React from "react";
import { FileProps } from "../internal";
export default class File extends React.Component<FileProps> {
    shouldComponentUpdate(nextProps: FileProps): boolean;
    render(): React.ReactElement<FileProps, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
