import React, { ErrorInfo, useEffect } from "react";
import { Dir } from "@shuvi/react-fs";
import FileNode from "./components/files/FileNode";
import IndexFile from "./components/IndexFile";
import BootstrapFile from "./components/BootstrapFile";
import AppFile from "./components/AppFile";
import Polyfill from "./components/PolyfillFile";

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
      <IndexFile />
      <Dir name="core">
        <BootstrapFile />
        <AppFile />
        <RoutesFile />
        <Polyfill />
      </Dir>
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
