import React from "react";
import Module from "./files/Module";
import { useSelector } from "../models/store";

function App() {
  const source = useSelector(state => state.appModule);

  return <Module name="app.js" source={source} />;
}

export default React.memo(App);
