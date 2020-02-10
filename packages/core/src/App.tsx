import React, { ErrorInfo } from "react";
import { File } from "@shuvi/react-fs";
import FileNode from "./components/FileNode";
import Bootstrap from "./components/Bootstrap";
import { useStore } from "./store";

function App() {
  const files = useStore(state => state.files);
  const bootstrapFilePath = useStore(state => state.bootstrapFilePath);
  const routesSource = useStore(state => state.routesSource);

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

export default class AppContainer extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("error", error);
  }

  render() {
    return <App />;
  }
}
