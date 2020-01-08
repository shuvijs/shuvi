import React from "react";
export interface BuiltInElements {
    file: {
        name: string;
        content: string;
    };
    dir: {
        name: string;
        children?: JSX.Element | JSX.Element[] | null;
    };
}
declare const _default: {
    render(reactElement: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>, rootDir: string, callback?: (() => void | null | undefined) | undefined): number;
};
export default _default;
