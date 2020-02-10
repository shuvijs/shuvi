/// <reference lib="dom" />
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { RouteConfig, RouteComponent } from "@shuvi/types/core";
declare type Data = Record<string, any>;
declare type Props = RouteComponentProps & {
    initialProps?: Data;
};
export declare function withInitialProps<P = {}>(WrappedComponent: RouteComponent<React.ComponentType<any>>): RouteComponent<React.ComponentClass<Props & P>>;
declare function renderRoutes(routes?: RouteConfig[], initialProps?: Data, switchProps?: Data): JSX.Element | null;
export default renderRoutes;
