import * as React from 'react';
import { SideEffectProps, HeadState } from './types';
declare const _default: () => {
  new (props: any): {
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): React.ReactNode;
    context: unknown;
    setState<K extends never>(
      state:
        | {}
        | ((
            prevState: Readonly<{}>,
            props: Readonly<React.PropsWithChildren<SideEffectProps>>
          ) => {} | Pick<{}, K> | null)
        | Pick<{}, K>
        | null,
      callback?: (() => void) | undefined
    ): void;
    forceUpdate(callback?: (() => void) | undefined): void;
    readonly props: Readonly<React.PropsWithChildren<SideEffectProps>>;
    state: Readonly<{}>;
    refs: {
      [key: string]: React.ReactInstance;
    };
    shouldComponentUpdate?(
      nextProps: Readonly<React.PropsWithChildren<SideEffectProps>>,
      nextState: Readonly<{}>,
      nextContext: any
    ): boolean;
    componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
    getSnapshotBeforeUpdate?(
      prevProps: Readonly<React.PropsWithChildren<SideEffectProps>>,
      prevState: Readonly<{}>
    ): any;
    componentWillMount?(): void;
    UNSAFE_componentWillMount?(): void;
    componentWillReceiveProps?(
      nextProps: Readonly<React.PropsWithChildren<SideEffectProps>>,
      nextContext: any
    ): void;
    UNSAFE_componentWillReceiveProps?(
      nextProps: Readonly<React.PropsWithChildren<SideEffectProps>>,
      nextContext: any
    ): void;
    componentWillUpdate?(
      nextProps: Readonly<React.PropsWithChildren<SideEffectProps>>,
      nextState: Readonly<{}>,
      nextContext: any
    ): void;
    UNSAFE_componentWillUpdate?(
      nextProps: Readonly<React.PropsWithChildren<SideEffectProps>>,
      nextState: Readonly<{}>,
      nextContext: any
    ): void;
  };
  rewind(): HeadState | undefined;
  contextType?: React.Context<any> | undefined;
};
export default _default;
