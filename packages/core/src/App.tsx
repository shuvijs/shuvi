import React, { ErrorInfo, useEffect } from "react";
import { File } from "@shuvi/react-fs";
import FileNode from "./components/FileNode";
import Bootstrap from "./components/Bootstrap";
import PriorityFile from "./components/FilePriorityFile";
import { useSelector } from "./models/store";

interface AppProps {
  onDidUpdate: () => void;
}

function App(props: AppProps) {
  const files = useSelector(state => state.extraFiles);
  const bootstrap = useSelector(state => state.bootstrapModule);
  const app = useSelector(state => ({
    fallbackFile: state.appModuleFallback,
    lookupFiles: state.appModuleLookups
  }));
  const document = useSelector(state => ({
    fallbackFile: state.documentModuleFallback,
    lookupFiles: state.documentModuleLookups
  }));
  const routesContent = useSelector(state => state.routesContent);

  useEffect(() => {
    props.onDidUpdate();
  });

  return (
    <>
      <Bootstrap module={bootstrap} />
      <PriorityFile name="app.js" {...app} />
      <PriorityFile name="document.js" {...document} />
      <File name="routes.js" content={routesContent} />
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
