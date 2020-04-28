import React from "react";
import { observer } from 'mobx-react';
import { File } from "@shuvi/react-fs";
import { useSelector } from "../models/store";

function Routes() {
  const routesContent = useSelector(state => state.routesContent);

  return <File name="routes.js" content={routesContent} />;
}

export default observer(Routes);
