import React from "react";
import FileNode from "./components/FileNode";
import Bootstrap from "./components/Bootstrap";
import { useStore } from "./store";

export default function App() {
  const files = useStore(state => state.files);
  const bootstrapSrc = useStore(state => state.bootstrapSrc);

  return (
    <>
      <Bootstrap src={bootstrapSrc} />
      {files.map(file => (
        <FileNode key={file.name} file={file} />
      ))}
    </>
  );
}
