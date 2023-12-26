import MemoryHistory, { MemoryHistoryOptions, InitialEntry } from './memory';
import BrowserHistory, { BrowserHistoryOptions } from './browser';
import HashHistory, { HashHistoryOptions } from './hash';

export * from './base';

export { MemoryHistory, MemoryHistoryOptions, InitialEntry };

export function createBrowserHistory(
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  return new BrowserHistory(options);
}

export function createHashHistory(
  options: HashHistoryOptions = {}
): HashHistory {
  return new HashHistory(options);
}

export function createMemoryHistory(
  options: MemoryHistoryOptions = {}
): MemoryHistory {
  return new MemoryHistory(options);
}
