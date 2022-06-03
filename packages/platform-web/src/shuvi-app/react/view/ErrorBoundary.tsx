import React, { PropsWithChildren } from 'react';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import ErrorPage from '../ErrorPage';

type ErrorBoundaryState = { error: Error | null };
type ErrorInfo = { componentStack?: string | null };

class ErrorBoundary extends React.PureComponent<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  state = { error: null };

  componentDidCatch(
    error: Error,
    // Loosely typed because it depends on the React version and was
    // accidentally excluded in some versions.
    errorInfo?: ErrorInfo
  ) {
    this.setState({ error });
    console.error('the error is below: \n', error);
    if (errorInfo && errorInfo.componentStack) {
      console.error(
        'the componentStack is below: \n',
        errorInfo.componentStack
      );
    }
  }

  render() {
    return this.state.error ? (
      // The component has to be unmounted or else it would continue to error
      <ErrorPage errorCode={SHUVI_ERROR_CODE.APP_ERROR} />
    ) : (
      (this.props.children as unknown as React.ReactNode)
    );
  }
}

export { ErrorBoundary };
