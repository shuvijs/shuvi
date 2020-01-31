import React, { ErrorInfo } from "react";
export default class AppContainer extends React.Component {
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): JSX.Element;
}
