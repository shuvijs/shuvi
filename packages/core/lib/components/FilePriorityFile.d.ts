import { WatchEvent } from "@shuvi/utils/lib/fileWatcher";
import { BaseComponent } from "./Base";
export interface Props {
    name: string;
    lookupFiles: string[];
    fallbackFile: string;
}
interface State {
    file: string;
}
export default class FileSelector extends BaseComponent<Props, State> {
    private _watcherHandle;
    private _knownFiles;
    constructor(props: Props);
    _onFilesChange({ removals, changes }: WatchEvent): void;
    _destoryWatcher(): void;
    _createWatcher(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: Props): void;
    shouldComponentUpdate(nextProps: Props, nextState: State): boolean;
    render(): JSX.Element;
}
export {};
