import React from "react";
import { observer } from 'mobx-react';
import { File } from "@shuvi/react-fs";
import { useSelector } from "../models/store";

function Renderer() {
  const bootstrap = useSelector(state => state.rendererModule);

  return <File name="renderer.js" content={`export * from "${bootstrap}"`} />;
}

export default observer(Renderer);
