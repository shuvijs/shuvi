import React from "react";
import { DirProps } from "../internal";
export default class Dir extends React.PureComponent<DirProps> {
    render(): React.ReactElement<DirProps, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
