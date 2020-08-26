import {
  State,
  History,
  HistoryState,
  Blocker,
  Listener,
  Location,
  ResolvedPath,
  To,
  Action
} from '../types';
import {
  createLocation,
  createEvents,
  resolvePath,
  pathToString
} from '../utils';

/**
 * A POP indicates a change to an arbitrary index in the history stack, such
 * as a back or forward navigation. It does not describe the direction of the
 * navigation, only that the current index changed.
 *
 * Note: This is the default action for newly created history objects.
 */
export const ACTION_POP: Action = 'Pop';

/**
 * A PUSH indicates a new entry being added to the history stack, such as when
 * a link is clicked and a new page loads. When this happens, all subsequent
 * entries in the stack are lost.
 */
export const ACTION_PUSH: Action = 'Push';

/**
 * A REPLACE indicates the entry at the current index in the history stack
 * being replaced by a new one.
 */
export const ACTION_REPLACE: Action = 'Replace';

interface TransitionOptions {
  state?: State;
  replace?: boolean;
  handleTransion: (event: {
    location: Location;
    state: HistoryState;
    url: string;
  }) => void;
}

export default abstract class BaseHistory implements History {
  action: Action = ACTION_POP;
  location: Location = createLocation('/');

  protected _index: number = 0;
  protected _blockers = createEvents<Blocker>();
  private _listeners = createEvents<Listener>();

  // ### implemented by sub-classes ###
  // base interface
  protected abstract getIndexAndLocation(): [number /* index */, Location];

  // history interface
  abstract push(to: To, state?: object | null | undefined): void;
  abstract replace(to: To, state?: object | null | undefined): void;
  abstract go(delta: number): void;
  abstract block(blocker: Blocker<State>): () => void;

  back(): void {
    this.go(-1);
  }

  forward(): void {
    this.go(1);
  }

  listen(listener: Listener) {
    return this._listeners.push(listener);
  }

  resolve(to: any, from?: any): ResolvedPath {
    const toPath = resolvePath(to, from);
    return {
      path: toPath,
      href: pathToString(toPath)
    };
  }

  protected transitionTo(
    to: To,
    { handleTransion, replace = false, state = null }: TransitionOptions
  ) {
    const nextAction = replace ? ACTION_REPLACE : ACTION_PUSH;
    const nextLocation = createLocation(to, { state });

    // check transition
    if (this._blockers.length) {
      this._blockers.call({
        action: nextAction,
        location: nextLocation,
        retry: () => {
          this.transitionTo(to, {
            handleTransion,
            replace,
            state
          });
        }
      });
      return;
    }

    // TODO: call before hooks

    handleTransion({
      location: nextLocation,
      state: {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: this._index + 1
      },
      url: this.resolve(nextLocation).href
    });

    this._applyTx(nextAction);
  }

  protected _applyTx(nextAction: Action) {
    // update state
    this.action = nextAction;
    [this._index, this.location] = this.getIndexAndLocation();

    // notify listener
    this._listeners.call({ action: this.action, location: this.location });
  }
}
