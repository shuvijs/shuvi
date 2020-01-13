import React from "react";
import { File } from "@shuvi/react-fs";
// import { memoizeOne } from "../utils";

export interface Props {
  name: string;
  files: [string, string, ...string[]];
}

interface State {
  file: string;
}

export default class TemplateFile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      file: props.files[props.files.length - 1]
    };
  }

  render() {
    const { name } = this.props;
    const { file } = this.state;

    return (
      <File
        name={name}
        content={`
export { default } from "${file}";
export * from "${file}";
        `.trim()}
      />
    );
  }
}
