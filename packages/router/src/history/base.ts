import {
  State,
  HistoryState,
  Blocker,
  Location,
  ResolvedPath,
  PathRecord,
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
  action?: Action;
  redirectedFrom?: PathRecord;
  onTransition(event: {
    location: Location;
    state: HistoryState;
    url: string;
  }): void;
  onAbort?(): void;
}

export interface PushOptions {
  state?: object | null | undefined;
  redirectedFrom?: PathRecord;
}

export default abstract class BaseHistory {
  action: Action = ACTION_POP;
  location: Location = createLocation('/');
  doTransision: (
    to: PathRecord,
    onComplete: Function,
    onAbort?: Function
  ) => void = () => void 0;

  protected _index: number = 0;
  protected _blockers = createEvents<Blocker>();

  // ### implemented by sub-classes ###
  // base interface
  protected abstract getIndexAndLocation(): [number /* index */, Location];
  abstract setup(): void;

  // history interface
  abstract push(to: PathRecord, options: PushOptions): void;
  abstract replace(to: PathRecord, options?: PushOptions): void;
  abstract go(delta: number): void;
  abstract block(blocker: Blocker<State>): () => void;

  back(): void {
    this.go(-1);
  }

  forward(): void {
    this.go(1);
  }

  resolve(to: any, from?: any): ResolvedPath {
    const toPath = resolvePath(to, from);
    return {
      path: toPath,
      href: pathToString(toPath)
    };
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
    const nextLocation = createLocation(to, { state, redirectedFrom });

    // check transition
    if (this._blockers.length) {
      this._blockers.call({
        action,
        location: nextLocation,
        retry: () => {
          this.transitionTo(to, {
            onTransition,
            onAbort,
            action,
            state,
            redirectedFrom
          });
        }
      });
      return;
    }

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

        this._updateState(action);
      },
      onAbort
    );
  }

  private _updateState(nextAction: Action) {
    // update state
    this.action = nextAction;
    [this._index, this.location] = this.getIndexAndLocation();
  }
}
