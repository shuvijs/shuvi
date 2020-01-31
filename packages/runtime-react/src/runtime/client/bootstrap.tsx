/// <reference lib="dom" />

import React from "react";
import ReactDom from "react-dom";
import { Runtime } from "@shuvi/core";
import { BrowserRouter } from "react-router-dom";
import App from "../shared/app";

export const bootstrap: Runtime.Bootstrap<React.ComponentType<any>> = () => {
  return ReactDom.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById("__app")
  );
};
