import {
  HistoryState,
  Location,
  PathRecord,
  State,
  Key,
  Blocker,
  Path
} from '../types';
import { readOnly, Events } from './misc';
import { resolvePath, stripBase } from './path';

const BeforeUnloadEventType = 'beforeunload';

function promptBeforeUnload(event: BeforeUnloadEvent) {
  // Cancel the event.
  event.preventDefault();
  // Chrome (and legacy IE) requires returnValue to be set.
  event.returnValue = '';
}

function createKey() {
  return Math.random().toString(36).substr(2, 8);
}

export function createLocation(
  to: PathRecord,
  {
    basename,
    state = null,
    key,
    redirectedFrom
  }: { basename?: string; state?: State; key?: Key; redirectedFrom?: Path } = {}
) {
  const resolved = resolvePath(to);
  const pathnameWithoutBase = stripBase(resolved.pathname, basename || '/');
  if (pathnameWithoutBase) {
    resolved.pathname = pathnameWithoutBase;
  }
  const notMatchBasename = Boolean(basename) && !pathnameWithoutBase;
  return readOnly<Location<any>>({
    ...resolved,
    redirectedFrom,
    notMatchBasename,
    state,
    key: key || createKey()
  });
}

export function pushState(
  state: HistoryState,
  url?: string,
  { replace = false }: { replace?: boolean } = {}
) {
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history;
  try {
    if (replace) {
      history.replaceState(state, '', url);
    } else {
      history.pushState(state, '', url);
    }
  } catch (e) {
    // @ts-ignore url is undefined
    window.location[replace ? 'replace' : 'assign'](url);
  }
}

export function replaceState(state: HistoryState, url?: string) {
  pushState(state, url, { replace: true });
}

export function addBlocker(blockers: Events<Blocker>, blocker: Blocker) {
  let unblock = blockers.push(blocker);

  if (blockers.length === 1) {
    window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
  }

  return function () {
    unblock();

    // Remove the beforeunload listener so the document may
    // still be salvageable in the pagehide event.
    // See https://html.spec.whatwg.org/#unloading-documents
    if (!blockers.length) {
      window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
    }
  };
}
