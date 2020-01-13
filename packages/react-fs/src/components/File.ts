import react from "react";
import { FileProps } from "../internal";

export default function File(props: FileProps) {
  return react.createElement<FileProps>("file", props);
}

File.displayName = 'File';
