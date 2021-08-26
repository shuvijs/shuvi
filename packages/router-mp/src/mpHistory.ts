import {
  PathRecord,
  Location,
  Blocker,
  MemoryHistoryOptions,
  ResolvedPath,
  createLocation,
  resolvePath,
  pathToString
} from '@shuvi/router';
import invariant from '@shuvi/utils/lib/invariant';
import { navigateTo, redirectTo, navigateBack } from './navigateApis';
import BaseHisotry, {
  PushOptions,
  ACTION_PUSH,
  TransitionOptions
} from '@shuvi/router/lib/history/base';

export class MpHistory extends BaseHisotry {
  private _entries: Location[] = [];

  constructor({
    initialEntries = ['/'],
    initialIndex = 0
  }: MemoryHistoryOptions = {}) {
    super();
    this._entries = initialEntries.map(entry => {
      let location = createLocation({
        pathname: '/',
        search: '',
        ...(typeof entry === 'string' ? resolvePath(entry) : entry),
        hash: '' // no support hash
      });

      invariant(
        location.pathname.charAt(0) === '/',
        `Relative pathnames are not supported in createMpHistory({ initialEntries }) (invalid entry: ${JSON.stringify(
          entry
        )})`
      );

      return location;
    });
    this._index = initialIndex;
    this.location = this._entries[this._index];
  }

  setup() {
    // do nothing
  }

  push(to: PathRecord, { state, redirectedFrom }: PushOptions = {}) {
    // open in new window
    const { href } = this.resolve(to, this.location.pathname);
    return navigateTo({ url: href });
  }

  replace(to: PathRecord, { state, redirectedFrom }: PushOptions = {}) {
    // replace in current window
    const { href } = this.resolve(to, this.location.pathname);
    return redirectTo({ url: href });
  }

  go(delta: number): void {
    invariant(delta < 0, 'delta should be negative integer');
    navigateBack({
      delta
    });
    // check transition
    if (this._blockers.length) {
      this._blockers.call({
        retry: () => {
          this.go(delta);
        }
      });
      return;
    }
  }

  transitionTo(
    to: PathRecord,
    {
      onTransition,
      onAbort,
      action = ACTION_PUSH,
      state = null,
      redirectedFrom
    }: TransitionOptions
  ) {
    const { path } = this.resolve(to, this.location.pathname);
    const nextLocation = createLocation(path, { state, redirectedFrom });
    this.doTransision(
      to,
      () => {
        onTransition({
          location: nextLocation,
          state: {
            usr: nextLocation.state,
            key: nextLocation.key,
            idx: this._index + 1
          },
          url: this.resolve(nextLocation).href
        });
      },
      onAbort
    );
  }

  block(blocker: Blocker): () => void {
    return this._blockers.push(blocker);
  }

  resolve(to: PathRecord, from?: string): ResolvedPath {
    const toPath = resolvePath(to, from);
    return {
      path: toPath,
      href: pathToString(toPath)
    };
  }

  protected getIndexAndLocation(): [number, Location] {
    const index = this._index;
    return [index, this._entries[index]];
  }
}

export function createMpHistory(options: MemoryHistoryOptions = {}): MpHistory {
  return new MpHistory(options);
}
