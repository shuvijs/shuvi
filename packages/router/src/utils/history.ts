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
import { resolvePath } from './path';

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
    state = null,
    key,
    redirectedFrom
  }: { state?: State; key?: Key; redirectedFrom?: Path } = {}
) {
  return readOnly<Location<any>>({
    ...resolvePath(to),
    redirectedFrom,
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
