import { Runtime } from "@shuvi/types";
import { History } from "history";

export { RouteProps } from "react-router-dom";

export type Router = Runtime.IRouter;

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

function onChange(listener: Runtime.IRouterListener) {
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
