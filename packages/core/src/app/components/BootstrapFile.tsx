import React from "react";
import { File } from "@shuvi/react-fs";
import { useSelector } from "../models/store";

function Bootstrap() {
  const bootstrap = useSelector(state => state.bootstrapModule);

  return <File name="bootstrap.js" content={`export * from "${bootstrap}"`} />;
}

export default React.memo(Bootstrap);
