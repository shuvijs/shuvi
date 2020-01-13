import react from "react";
import { DirProps } from "../internal";

export default function Dir(props: DirProps) {
  return react.createElement<DirProps>("dir", props);
}

Dir.displayName = 'Dir';
