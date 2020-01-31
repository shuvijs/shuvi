import React, { ErrorInfo } from "react";
import FileNode from "./components/FileNode";
import Bootstrap from "./components/Bootstrap";
import { useStore } from "./store";

function App() {
  const files = useStore(state => state.files);
  const bootstrapFile = useStore(state => state.bootstrapFile);

  return (
    <>
      <Bootstrap file={bootstrapFile} />
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
