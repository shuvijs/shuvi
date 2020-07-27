import { History, Location, Listener } from './history';

export interface IRouter {
  query: History['location']['query'];
  location: Location;
  push: History['push'];
  replace: History['replace'];
  go: History['go'];
  back: History['back'];
  forward(): void;
  onChange: (listener: Listener) => void;
}

export const createRouter = (history: History): IRouter => {
  return {
    get query() {
      return history.location.query;
    },
    get location() {
      return history.location;
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
    onChange: function (listener) {
      return history.listen(listener);
    }
  };
};
