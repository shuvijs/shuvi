import React from 'react';
import { ShuviErrorCode } from '@shuvi/router';
import ErrorPage from '../ErrorPage';

type ComponentStack = string | null;
type ErrorBoundaryProps = {
  onError: (error: Error, componentStack: ComponentStack) => void;
};
type ErrorBoundaryState = { error: Error | null };

type ErrorInfo = { componentStack?: ComponentStack };
class ErrorBoundary extends React.PureComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { error: null };

  componentDidCatch(
    error: Error,
    // Loosely typed because it depends on the React version and was
    // accidentally excluded in some versions.
    errorInfo?: ErrorInfo
  ) {
    this.props.onError(error, errorInfo?.componentStack || null);
    this.setState({ error });
  }

  render() {
    return this.state.error ? (
      // The component has to be unmounted or else it would continue to error
      <ErrorPage
        errorCode={ShuviErrorCode.APP_ERROR}
      />
    ) : (
      this.props.children
    );
  }
}

const onCatchError = function (error: Error, componentStack?: ComponentStack) {
  console.error('the error is below: \n', error);
  if (componentStack) {
    console.error('the componentStack is below: ', componentStack);
  }
};

export { ErrorBoundary, onCatchError };