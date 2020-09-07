import {
  GlobalHistory,
  PathRecord,
  Location,
  Blocker,
  Transition
} from '../types';
import {
  createLocation,
  pushState,
  replaceState,
  addBlocker,
  resolvePath,
  pathToString,
  warning
} from '../utils';
import BaseHisotry, { PushOptions, ACTION_POP, ACTION_REPLACE } from './base';

export default class HashHistory extends BaseHisotry {
  private _history: GlobalHistory = window.history;

  constructor() {
    super();
    [this._index, this.location] = this.getIndexAndLocation();
    if (this._index == null) {
      this._index = 0;
      this._history.replaceState(
        { ...this._history.state, idx: this._index },
        ''
      );
    }
  }

  push(to: PathRecord, { state, redirectedFrom }: PushOptions = {}) {
    return this.transitionTo(to, {
      state,
      redirectedFrom,
      onTransition({ state, url }) {
        pushState(state, url);
      }
    });
  }

  replace(to: PathRecord, { state, redirectedFrom }: PushOptions = {}) {
    return this.transitionTo(to, {
      state,
      action: ACTION_REPLACE,
      redirectedFrom,
      onTransition({ state, url }) {
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

  setup() {
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
          this.transitionTo(nextLocation, {
            onTransition: () => {},
            action: nextAction
          });
        }
      }
    };

    window.addEventListener('popstate', handlePop);

    // popstate does not fire on hashchange in IE 11 and old (trident) Edge
    // https://developer.mozilla.org/de/docs/Web/API/Window/popstate_event
    window.addEventListener('hashchange', () => {
      const [, nextLocation] = this.getIndexAndLocation();

      // Ignore extraneous hashchange events.
      if (pathToString(nextLocation) !== pathToString(location)) {
        handlePop();
      }
    });
  }

  protected getIndexAndLocation(): [number, Location] {
    const { pathname, search, hash } = resolvePath(
      window.location.hash.substr(1)
    );
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
