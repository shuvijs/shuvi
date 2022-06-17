import MemoryHistory, { MemoryHistoryOptions, InitialEntry } from './memory';
import BrowserHistory from './browser';
import HashHistory from './hash';

export * from './base';

export { MemoryHistory, MemoryHistoryOptions, InitialEntry };

export function createBrowserHistory(): BrowserHistory {
  return new BrowserHistory();
}

export function createHashHistory(): HashHistory {
  return new HashHistory();
}

export function createMemoryHistory(
  options: MemoryHistoryOptions = {}
): MemoryHistory {
  return new MemoryHistory(options);
}
