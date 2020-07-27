import {
  Location,
  Action,
  createPath,
  History as OriHistory,
  parsePath,
  PartialPath,
  State,
  To,
  Listener,
  createBrowserHistory as oriCreateBrowserHistory,
  createHashHistory as oriCreateHashHistory,
  createMemoryHistory as oriCreateMemoryHistory,
  BrowserHistoryOptions,
  HashHistoryOptions,
  MemoryHistoryOptions,
  InitialEntry,
  Blocker,
  Path,
  Transition,
  MemoryHistory as OriMemoryHistory,
  Update
} from 'history';
import { parse, ParsedUrlQuery } from 'querystring';

// History with query
type History<H extends OriHistory = OriHistory> = H & { location: ILocation };
type MemoryHistory = History<OriMemoryHistory>;

interface ILocation extends Location {
  query: ParsedUrlQuery;
}

interface ServerHistoryContext {
  action?: Action;
  location?: To;
  url?: string;
}

interface ServerHistoryOptions {
  basename: string;
  context: ServerHistoryContext;
  location: string;
}

function addLeadingSlash(path: string) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function addBasename(basename: string, location: PartialPath) {
  if (!basename) return location;

  return {
    ...location,
    pathname: addLeadingSlash(basename) + location.pathname
  };
}

function createServerLocation({
  pathname,
  hash,
  search
}: PartialPath): Location<State> {
  return {
    pathname: pathname!, // we assume that pathname is always given
    hash: hash || '',
    search: search || '',
    key: 'default', // always start with default value
    state: null // always start with default value
  };
}

function stripBasename(basename: string, location: PartialPath) {
  if (!basename) return createServerLocation(location);

  const base = addLeadingSlash(basename);

  if (location.pathname?.indexOf(base) !== 0)
    return createServerLocation(location);

  return createServerLocation({
    ...location,
    pathname: location.pathname.substr(base.length)
  });
}

function noop() {}

function createURL(location: To) {
  return typeof location === 'string' ? location : createPath(location);
}

function createServerHistory({
  basename,
  location,
  context
}: ServerHistoryOptions): History {
  const navigateTo = (location: To, action: Action) => {
    context.action = action;
    context.location = addBasename(
      basename,
      typeof location === 'string' ? parsePath(location) : location
    );
    context.url = createURL(context.location);
  };

  const handlePush = (location: To) => navigateTo(location, Action.Push);
  const handleReplace = (location: To) => navigateTo(location, Action.Replace);
  const handleListen = () => noop;
  const handleBlock = () => noop;

  return enchanceHistory({
    // length: 1,
    createHref: (path: To) => addLeadingSlash(basename + createURL(path)),
    action: Action.Pop,
    location: stripBasename(basename, parsePath(location)),
    push: handlePush,
    replace: handleReplace,
    go: noop,
    back: noop,
    forward: noop,
    listen: handleListen,
    block: handleBlock
  });
}

const addQuery = (location: Location) => {
  const { search } = location;
  return {
    ...location,
    query: search
      ? parse(search.charAt(0) === '?' ? search.substring(1) : search)
      : {}
  };
};

const enchanceHistory = <H extends OriHistory>(history: H) => {
  // @ts-ignore
  const queryHistory: History<H> = {
    ...history,
    listen: listener =>
      history.listen(({ location, action }) => {
        const queryLocation = addQuery(location);
        listener({ location: queryLocation, action });
      })
  };
  Object.defineProperty(queryHistory, 'location', {
    get: () => addQuery(history.location)
  });

  return queryHistory;
};

const createBrowserHistory = (options?: BrowserHistoryOptions) => {
  return enchanceHistory(oriCreateBrowserHistory(options));
};

const createHashHistory = (options?: HashHistoryOptions) => {
  return enchanceHistory(oriCreateHashHistory(options));
};

const createMemoryHistory = (options?: MemoryHistoryOptions) => {
  return enchanceHistory(oriCreateMemoryHistory(options));
};

export {
  Location,
  Action,
  createPath,
  History,
  parsePath,
  PartialPath,
  State,
  To,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  createServerHistory,
  Listener,
  InitialEntry,
  Blocker,
  Path,
  Transition,
  MemoryHistory,
  Update
};
