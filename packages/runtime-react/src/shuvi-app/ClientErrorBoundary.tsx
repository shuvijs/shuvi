import * as React from 'react';

export interface IClientErrorBoundaryProps {
  onError(error: any): void;
}

export default class ClientErrorBoundary extends React.Component<
  IClientErrorBoundaryProps
> {
  componentDidCatch(error: any) {
    this.props.onError(error);
  }

  public render() {
    const { children } = this.props;
    return children;
  }
}
