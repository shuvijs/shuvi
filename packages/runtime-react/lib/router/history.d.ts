import { History } from "history";
interface HistoryOptions {
    basename: string;
}
interface ServerHistoryOptions extends HistoryOptions {
    context: any;
    location: string;
}
export declare function createBrowserHistory(historyOptions: HistoryOptions): History<History.PoorMansUnknown>;
export declare function createHashHistory(historyOptions: HistoryOptions): History<History.PoorMansUnknown>;
export declare function createServerHistory({ basename, location, context }: ServerHistoryOptions): History;
export {};
