import * as React from 'react';
import { PropsWithChildren } from 'react';
declare type ErrorBoundaryState = {
  error: Error | null;
};
declare type ErrorInfo = {
  componentStack?: string | null;
};
declare class ErrorBoundary extends React.PureComponent<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  state: {
    error: null;
  };
  componentDidCatch(error: Error, errorInfo?: ErrorInfo): void;
  render():
    | string
    | number
    | boolean
    | JSX.Element
    | React.ReactFragment
    | null
    | undefined;
}
export { ErrorBoundary };
