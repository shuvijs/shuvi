/// <reference lib="dom" />

import React from "react";
import ReactDom from "react-dom";
import { Runtime } from "@shuvi/core";

export const bootstrap: Runtime.Bootstrap<React.ComponentType<any>> = ({
  App
}) => {
  return ReactDom.render(<App />, document.getElementById("__app"));
};
