import * as React from 'react';

export interface IClientErrorBoundaryProps {
  onError(error: Error): void;
}

export default class ClientErrorBoundary extends React.Component<
  IClientErrorBoundaryProps
> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  public render() {
    const { children } = this.props;
    return children;
  }
}
