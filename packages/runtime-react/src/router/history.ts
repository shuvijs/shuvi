import { Runtime } from '@shuvi/types';
import {
  Location,
  Action,
  createLocation,
  createPath,
  History,
  LocationDescriptor,
  LocationDescriptorObject,
  createBrowserHistory as oldCreateBrowserHistory,
  createHashHistory as oldCreateHashHistory
} from 'history-with-query';

export { History };

declare module 'history-with-query' {
  interface Location {
    query: Runtime.IQuery;
  }
}

export { MemoryHistory, createMemoryHistory } from 'history-with-query';

interface HistoryOptions {
  basename: string;
}

interface ServerHistoryContext extends Runtime.IRouterServerContext {
  action?: Action;
  location?: LocationDescriptor;
}

interface ServerHistoryOptions extends HistoryOptions {
  context: ServerHistoryContext;
  location: string;
}

function addLeadingSlash(path: string) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function addBasename(basename: string, location: LocationDescriptorObject) {
  if (!basename) return location;

  return {
    ...location,
    pathname: addLeadingSlash(basename) + location.pathname
  };
}

function stripBasename(basename: string, location: Location) {
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location.pathname.indexOf(base) !== 0) return location;

  return {
    ...location,
    pathname: location.pathname.substr(base.length)
  };
}

function noop() {}

function createURL(location: LocationDescriptorObject) {
  return typeof location === 'string' ? location : createPath(location);
}

export function createBrowserHistory(historyOptions: HistoryOptions) {
  return oldCreateBrowserHistory(historyOptions);
}

export function createHashHistory(historyOptions: HistoryOptions) {
  return oldCreateHashHistory(historyOptions);
}

export function createServerHistory({
  basename,
  location,
  context
}: ServerHistoryOptions): History {
  const navigateTo = (location: LocationDescriptor, action: Action) => {
    context.action = action;
    context.location = addBasename(basename, createLocation(location));
    context.url = createURL(context.location);
  };

  const handlePush = (location: LocationDescriptor) =>
    navigateTo(location, 'PUSH');
  const handleReplace = (location: LocationDescriptor) =>
    navigateTo(location, 'REPLACE');
  const handleListen = () => noop;
  const handleBlock = () => noop;

  return {
    length: 1,
    createHref: (path: LocationDescriptorObject) =>
      addLeadingSlash(basename + createURL(path)),
    action: 'POP',
    location: stripBasename(basename, createLocation(location)),
    push: handlePush,
    replace: handleReplace,
    go: noop,
    goBack: noop,
    goForward: noop,
    listen: handleListen,
    block: handleBlock
  };
}
