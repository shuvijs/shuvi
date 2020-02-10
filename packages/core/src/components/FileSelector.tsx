import React from "react";
import { File } from "@shuvi/react-fs";
import { watch, WatchEvent } from "@shuvi/utils/lib/fileWatcher";
import fse from "fs-extra";
import { arrayEqual } from "../utils";
import { BaseComponent } from "./Base";

export interface Props {
  name: string;
  files: [string, ...string[]];
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

export default class FileSelector extends BaseComponent<Props, State> {
  private _watcherHandle: (() => void) | undefined;
  private _knownFiles = new Map<string, true>();

  constructor(props: Props) {
    super(props);

    const file = findFirstExistedFile(props.files);
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

    const { files, fallbackFile } = this.props;
    let selectedFile: string = fallbackFile;
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
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
    if (this.props.files.length) {
      this._watcherHandle = watch(
        { files: this.props.files },
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
    if (!arrayEqual(prevProps.files, this.props.files)) {
      this._createWatcher();
    }
  }

  render() {
    const { name } = this.props;
    const { file } = this.state;

    return (
      <File name={name} content={`module.exports = require("${file}");`} />
    );
  }
}
