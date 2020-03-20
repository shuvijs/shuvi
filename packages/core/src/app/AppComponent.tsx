import React, { ErrorInfo, useEffect } from "react";
import FileNode from "./components/files/FileNode";
import BootstrapFile from "./components/BootstrapFile";
import AppFile from "./components/AppFile";
import RoutesFile from "./components/RoutesFile";
import { useSelector } from "./models/store";

interface AppProps {
  onDidRender: () => void;
}

function App(props: AppProps) {
  const files = useSelector(state => state.extraFiles);

  useEffect(() => {
    props.onDidRender();
  });

  return (
    <>
      <BootstrapFile />
      <AppFile />
      <RoutesFile />
      {files.map(file => (
        <FileNode key={file.name} file={file} />
      ))}
    </>
  );
}

export default class AppContainer extends React.Component<AppProps> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("error", error);
  }

  componentDidUpdate() {
    this.props.onDidRender();
  }

  render() {
    return <App {...this.props} />;
  }
}
