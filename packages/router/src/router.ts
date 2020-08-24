import { History, Location, Listener } from './types';

export interface IRouter {
  current: Location;
  action: History['action'];
  push: History['push'];
  replace: History['replace'];
  go: History['go'];
  back: History['back'];
  block: History['block'];
  resolve: History['resolve'];
  forward(): void;
  onChange: (listener: Listener) => void;
}

export const createRouter = (history: History): IRouter => {
  return {
    // @ts-ignore
    get current() {
      return history.location;
    },
    get action() {
      return history.action;
    },
    push: function (...args) {
      history.push(...args);
    },
    replace: function (...args) {
      history.replace(...args);
    },
    go: function (...args) {
      history.go(...args);
    },
    back: function (...args) {
      history.back(...args);
    },
    forward: function (...args) {
      history.forward(...args);
    },
    block: history.block,
    onChange: function (listener) {
      return history.listen(listener);
    },
    resolve: history.resolve
  };
};
