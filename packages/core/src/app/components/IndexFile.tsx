import React from "react";
import Module from "../components/files/Module";
import { useSelector } from "../models/store";

function Index() {
  const exports = useSelector(state => state.exports);
  return <Module name="index.js" exports={exports} />;
}

export default React.memo(Index);
