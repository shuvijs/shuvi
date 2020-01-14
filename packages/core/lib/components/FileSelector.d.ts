import React from "react";
import { WatchEvent } from "../helper/watcher";
export interface Props {
    name: string;
    files: [string, ...string[]];
    fallbackFile: string;
}
interface State {
    file: string;
}
export default class FileSelector extends React.Component<Props, State> {
    private _watcherHandle;
    private _knownFiles;
    constructor(props: Props);
    _onFilesChange({ removals, changes }: WatchEvent): void;
    _destoryWatcher(): void;
    _createWatcher(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: Props): void;
    render(): JSX.Element;
}
export {};
