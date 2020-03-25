import React from "react";
import { File } from "@shuvi/react-fs";
import { useSelector } from "../models/store";

function App() {
  const app = useSelector(state => state.appModule);

  return <File name="app.js" content={`export * from "${app}"`} />;
}

export default React.memo(App);
