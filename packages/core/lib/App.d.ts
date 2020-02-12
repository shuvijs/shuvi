import React, { ErrorInfo } from "react";
interface AppProps {
    onDidUpdate: () => void;
}
export default class AppContainer extends React.Component<AppProps> {
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentDidUpdate(): void;
    render(): JSX.Element;
}
export {};
