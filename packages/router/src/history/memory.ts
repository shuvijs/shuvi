import { To, Location, Blocker, PartialLocation, ResolvedPath } from '../types';
import { createLocation, resolvePath, pathToString, warning } from '../utils';
import BaseHisotry, { ACTION_POP } from './base';

function clamp(n: number, lowerBound: number, upperBound: number) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}

/**
 * A user-supplied object that describes a location. Used when providing
 * entries to `createMemoryHistory` via its `initialEntries` option.
 */
export type InitialEntry = string | PartialLocation;

export type MemoryHistoryOptions = {
  initialEntries?: InitialEntry[];
  initialIndex?: number;
};

export default class MemoryHistory extends BaseHisotry {
  private _entries: Location[] = [];

  constructor({
    initialEntries = ['/'],
    initialIndex
  }: MemoryHistoryOptions = {}) {
    super();
    this._entries = initialEntries.map(entry => {
      let location = createLocation({
        pathname: '/',
        search: '',
        hash: '',
        ...(typeof entry === 'string' ? resolvePath(entry) : entry)
      });

      warning(
        location.pathname.charAt(0) === '/',
        `Relative pathnames are not supported in createMemoryHistory({ initialEntries }) (invalid entry: ${JSON.stringify(
          entry
        )})`
      );

      return location;
    });
    this._index = clamp(
      initialIndex == null ? this._entries.length - 1 : initialIndex,
      0,
      this._entries.length - 1
    );
    this.location = this._entries[this._index];
  }

  push(to: To, state?: object | null | undefined): void {
    this.transitionTo(to, {
      state,
      handleTransion: ({ location }) => {
        this._index += 1;
        this._entries.splice(this._index, this._entries.length, location);
      }
    });
  }

  replace(to: To, state?: object | null | undefined): void {
    this.transitionTo(to, {
      state,
      replace: true,
      handleTransion: ({ location }) => {
        this._entries[this._index] = location;
      }
    });
  }

  go(delta: number): void {
    const { _index: index, _entries: entries } = this;
    let nextIndex = clamp(index + delta, 0, entries.length - 1);
    let nextAction = ACTION_POP;
    let nextLocation = entries[nextIndex];

    // check transition
    if (this._blockers.length) {
      this._blockers.call({
        action: nextAction,
        location: nextLocation,
        retry: () => {
          this.go(delta);
        }
      });
      return;
    }

    this._index = nextIndex;
  }

  block(blocker: Blocker): () => void {
    return this._blockers.push(blocker);
  }

  resolve(to: To, from?: string): ResolvedPath {
    const toPath = resolvePath(to, from);
    return {
      path: toPath,
      href: pathToString(toPath)
    };
  }

  protected setup() {}

  protected getIndexAndLocation(): [number, Location] {
    const index = this._index;
    return [index, this._entries[index]];
  }
}
