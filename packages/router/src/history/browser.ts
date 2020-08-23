import {
  GlobalHistory,
  To,
  Location,
  Blocker,
  Transition,
  ResolvedPath
} from '../types';
import {
  createLocation,
  pushState,
  replaceState,
  addBlocker,
  pathToString,
  resolvePath,
  warning
} from '../utils';
import BaseHisotry, { ACTION_POP } from './base';

export default class BrowserHistory extends BaseHisotry {
  private _history: GlobalHistory = window.history;

  constructor() {
    super();
    this._setup();
  }

  push(to: To, state?: object | null | undefined): void {
    this.transitionTo(to, {
      state,
      handleTransion({ state, url }) {
        pushState(state, url);
      }
    });
  }

  replace(to: To, state?: object | null | undefined): void {
    this.transitionTo(to, {
      state,
      replace: true,
      handleTransion({ state, url }) {
        replaceState(state, url);
      }
    });
  }

  go(delta: number): void {
    this._history.go(delta);
  }

  block(blocker: Blocker): () => void {
    return addBlocker(this._blockers, blocker);
  }

  resolve(to: To, from?: string): ResolvedPath {
    const toPath = resolvePath(to, from);
    return {
      path: toPath,
      href: pathToString(toPath)
    };
  }

  private _setup() {
    [this._index, this.location] = this.getIndexAndLocation();
    if (this._index == null) {
      this._index = 0;
      this._history.replaceState(
        { ...this._history.state, idx: this._index },
        ''
      );
    }

    let blockedPopTx: Transition | null = null;
    const handlePop = () => {
      const index = this._index;
      const blockers = this._blockers;

      if (blockedPopTx) {
        blockers.call(blockedPopTx);
        blockedPopTx = null;
      } else {
        let nextAction = ACTION_POP;
        let [nextIndex, nextLocation] = this.getIndexAndLocation();

        if (blockers.length) {
          if (nextIndex != null) {
            let delta = index - nextIndex;
            if (delta) {
              // Revert the POP
              blockedPopTx = {
                action: nextAction,
                location: nextLocation,
                retry: () => {
                  this.go(delta * -1);
                }
              };

              this.go(delta);
            }
          } else {
            // Trying to POP to a location with no index. We did not create
            // this location, so we can't effectively block the navigation.
            warning(
              false,
              // TODO: Write up a doc that explains our blocking strategy in
              // detail and link to it here so people can understand better what
              // is going on and how to avoid it.
              `You are trying to block a POP navigation to a location that was not ` +
                `created by the history library. The block will fail silently in ` +
                `production, but in general you should do all navigation with the ` +
                `history library (instead of using window.history.pushState directly) ` +
                `to avoid this situation.`
            );
          }
        } else {
          this._applyTx(nextAction);
        }
      }
    };

    window.addEventListener('popstate', handlePop);
  }

  protected getIndexAndLocation(): [number, Location] {
    const { pathname, search, hash } = window.location;
    const state = this._history.state || {};
    return [
      state.idx,
      createLocation(
        {
          pathname,
          search,
          hash
        },
        {
          state: state.usr || null,
          key: state.key || 'default'
        }
      )
    ];
  }
}
