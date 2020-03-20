import { render, renderOnce } from "./renderer";

export { default as File } from "./components/File";
export { default as Dir } from "./components/Dir";
export { FileProps, DirProps } from "./types";

export default {
  render,
  renderOnce
};
