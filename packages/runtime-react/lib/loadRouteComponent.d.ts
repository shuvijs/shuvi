import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { RouteComponent } from "@shuvi/types/core";
declare type Data = Record<string, any>;
declare type Props = RouteComponentProps & {
    initialProps?: Data;
};
export declare function withInitialProps<P = {}>(WrappedComponent: RouteComponent<React.ComponentType<any>>): RouteComponent<React.ComponentClass<Props & P>>;
export declare function loadRouteComponent(loader: () => Promise<any>): React.ComponentType<{}>;
export {};
