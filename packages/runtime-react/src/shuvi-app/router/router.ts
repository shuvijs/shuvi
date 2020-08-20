import createEvent, { EventEmitter } from '@shuvi/utils/lib/eventEmitter';
import { Runtime } from '@shuvi/types';
import { History } from './history';

export { RouteProps } from 'react-router-dom';

export type Router = Runtime.IRouter;

let history: History;
let routerEvent: EventEmitter;

//@internal
export function setHistory(value: History) {
  history = value;
  routerEvent = createEvent();
}

//@internal
export function emitRouterEvent(event: string) {
  routerEvent && routerEvent.emit(event);
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

function onRouteChangeStart(listener: Runtime.IRouterListener) {
  return history.listen(listener);
}

function onRouteChangeComplete(listener: () => void) {
  routerEvent.on('route-change-complete', listener);

  return () => {
    routerEvent.off('route-change-complete', listener);
  };
}

const router: Router = {
  get query() {
    return history.location.query;
  },
  get location() {
    return history.location;
  },
  push,
  replace,
  go,
  goBack,
  goForward,
  onChange,
  onRouteChangeStart,
  onRouteChangeComplete
};

export default router;
