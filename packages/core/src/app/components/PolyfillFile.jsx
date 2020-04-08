import React from "react";
import { File } from "@shuvi/react-fs";
import { useSelector } from "../models/store";

function Polyfill() {
  const polyfills = useSelector(state => state.polyfills);
  return (
    <File
      name="polyfill.js"
      content={polyfills.map(file => `import "${file}"`).join("\n")}
    />
  );
}

export default React.memo(Polyfill);
