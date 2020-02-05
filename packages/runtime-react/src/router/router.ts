import {
  History,
  LocationListener,
  UnregisterCallback,
  Location,
  Action
} from "history";

export { Location, Action };

export type Router = Pick<
  History,
  "push" | "replace" | "go" | "goBack" | "goForward"
> & {
  onChange(listener: LocationListener): UnregisterCallback;
};

let history: History;

//@internal
export function setHistory(value: History) {
  history = value;
}

function push(...args: any[]) {
  // @ts-ignore
  history.push(...args);
}

function replace(...args: any[]) {
  // @ts-ignore
  history.replace(...args);
}

function go(...args: any[]) {
  // @ts-ignore
  history.go(...args);
}

function goBack(...args: any[]) {
  // @ts-ignore
  history.goBack(...args);
}

function goForward(...args: any[]) {
  // @ts-ignore
  history.goForward(...args);
}

function onChange(listener: LocationListener) {
  return history.listen(listener);
}

const router: Router = {
  push,
  replace,
  go,
  goBack,
  goForward,
  onChange
};

export default router;
