import React from "react";
import { File } from "@shuvi/react-fs";
import { watch, WatchEvent } from "@shuvi/utils/lib/fileWatcher";
import fse from "fs-extra";
import { arrayEqual } from "../../utils";

export interface Props {
  name: string;
  lookupFiles: string[];
  fallbackFile: string;
}

interface State {
  file: string;
}

function findFirstExistedFile(files: string[]): string | null {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (fse.existsSync(file)) {
      return file;
    }
  }

  return null;
}

export default class FileSelector extends React.Component<Props, State> {
  private _watcherHandle: (() => void) | undefined;
  private _knownFiles = new Map<string, true>();

  constructor(props: Props) {
    super(props);

    const file = findFirstExistedFile(props.lookupFiles);
    let selectedFile: string;
    if (file) {
      selectedFile = file;
      this._knownFiles.set(file, true);
    } else {
      selectedFile = props.fallbackFile;
    }
    this.state = {
      file: selectedFile
    };
    this._onFilesChange = this._onFilesChange.bind(this);
  }

  _onFilesChange({ removals, changes }: WatchEvent) {
    for (let index = 0; index < changes.length; index++) {
      const existed = changes[index];
      this._knownFiles.set(existed, true);
    }
    for (let index = 0; index < removals.length; index++) {
      const removed = removals[index];
      this._knownFiles.delete(removed);
    }

    const { lookupFiles, fallbackFile } = this.props;
    let selectedFile: string = fallbackFile;
    for (let index = 0; index < lookupFiles.length; index++) {
      const file = lookupFiles[index];
      if (this._knownFiles.has(file)) {
        selectedFile = file;
        break;
      }
    }

    if (selectedFile !== this.state.file) {
      this.setState({
        file: selectedFile
      });
    }
  }

  _destoryWatcher() {
    if (this._watcherHandle) {
      this._watcherHandle();
    }
  }

  _createWatcher() {
    this._destoryWatcher();
    if (this.props.lookupFiles.length) {
      this._watcherHandle = watch(
        { files: this.props.lookupFiles },
        this._onFilesChange
      );
    }
  }

  componentDidMount() {
    this._createWatcher();
  }

  componentWillUnmount() {
    this._destoryWatcher();
  }

  componentDidUpdate(prevProps: Props) {
    if (!arrayEqual(prevProps.lookupFiles, this.props.lookupFiles)) {
      this._createWatcher();
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.state !== nextState ||
      this.props.fallbackFile !== nextProps.fallbackFile ||
      !arrayEqual(this.props.lookupFiles, nextProps.lookupFiles)
    );
  }

  render() {
    const { name } = this.props;
    const { file } = this.state;

    return (
      <File name={name} content={`module.exports = require("${file}");`} />
    );
  }
}
