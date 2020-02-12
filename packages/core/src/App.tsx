import React, { ErrorInfo, useEffect } from "react";
import { File } from "@shuvi/react-fs";
import FileNode from "./components/FileNode";
import Bootstrap from "./components/Bootstrap";
import { useStore } from "./store";

interface AppProps {
  onDidUpdate: () => void;
}

function App(props: AppProps) {
  const files = useStore(state => state.files);
  const bootstrapFilePath = useStore(state => state.bootstrapFilePath);
  const routesSource = useStore(state => state.routesSource);

  useEffect(() => {
    props.onDidUpdate();
  });

  return (
    <>
      <Bootstrap file={bootstrapFilePath} />
      <File name="routes.js" content={routesSource} />
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
    this.props.onDidUpdate();
  }

  render() {
    return <App {...this.props} />;
  }
}
