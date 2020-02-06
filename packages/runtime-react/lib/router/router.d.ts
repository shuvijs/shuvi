import { History, LocationListener, UnregisterCallback, Location, Action } from "history";
export { RouteProps } from 'react-router-dom';
export { Location, Action };
export declare type Router = Pick<History, "push" | "replace" | "go" | "goBack" | "goForward"> & {
    onChange(listener: LocationListener): UnregisterCallback;
};
declare const router: Router;
export default router;
