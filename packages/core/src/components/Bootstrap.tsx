import React from "react";
import FileTemplate from "./FileTemplate";

interface Props {
  src: string;
}

export default function Bootstrap({ src }: Props) {
  return <FileTemplate name="bootstrap.js" templateSrc={src} />;
}
