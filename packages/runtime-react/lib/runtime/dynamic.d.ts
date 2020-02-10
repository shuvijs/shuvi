import React from "react";
export declare type LoaderComponent<P = {}> = Promise<React.ComponentType<P> | {
    default: React.ComponentType<P>;
}>;
export declare type Loader<P = {}> = () => LoaderComponent<P>;
export declare type LoadableGeneratedOptions = {
    webpack?(): () => string[];
    modules?: string[];
};
export declare type LoadableBaseOptions<P = {}> = LoadableGeneratedOptions & {
    loading?: ({ error, isLoading, pastDelay }: {
        error?: Error | null;
        isLoading?: boolean;
        pastDelay?: boolean;
        timedOut?: boolean;
    }) => JSX.Element | null;
    loader?: Loader<P>;
    ssr?: boolean;
};
export declare type DynamicOptions<P = {}> = LoadableBaseOptions<P>;
export declare type LoaderFn<P = {}> = (opts: DynamicOptions<P>) => React.ComponentType<P>;
export declare type LoadableComponent<P = {}> = React.ComponentType<P>;
export declare function noSSR<P = {}>(LoadableInitializer: LoaderFn<P>, dynamicOptions: DynamicOptions<P>): React.ComponentClass<P, any> | React.FunctionComponent<P> | (() => JSX.Element);
export default function dynamic<P = {}>(dynamicOptions: DynamicOptions<P> | Loader<P>, options?: DynamicOptions<P>): React.ComponentType<P>;
