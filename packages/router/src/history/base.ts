import {
  State,
  HistoryState,
  Blocker,
  Location,
  ResolvedPath,
  PathRecord,
  Path,
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
export const ACTION_POP: Action = 'POP';

/**
 * A Push indicates a new entry being added to the history stack, such as when
 * a link is clicked and a new page loads. When this happens, all subsequent
 * entries in the stack are lost.
 */
export const ACTION_PUSH: Action = 'PUSH';

/**
 * A REPLACE indicates the entry at the current index in the history stack
 * being replaced by a new one.
 */
export const ACTION_REPLACE: Action = 'REPLACE';

export interface TransitionOptions {
  state?: State;
  action?: Action;
  redirectedFrom?: Path;

  /**
   * skipGuards means this route transition will be straightforwardly executed without any before guard
   */
  skipGuards?: boolean;
  onTransition(event: {
    location: Location;
    state: HistoryState;
    url: string;
  }): void;
  onAbort?(): void;
}

export interface PushOptions {
  state?: object | null | undefined;
  redirectedFrom?: Path;
  skipGuards?: boolean;
}

export type BaseHistoryOptions = {
  basename?: string;
};

export default abstract class BaseHistory {
  action: Action = ACTION_POP;
  location: Location = createLocation('/');
  basename: string;

  constructor({ basename = '' }: BaseHistoryOptions = {}) {
    this.basename = basename;
  }

  doTransition: (
    to: PathRecord,
    onComplete: Function,
    onAbort?: Function,
    skipGuards?: boolean,
    isReplace?: boolean,
    redirectedFrom?: Path
  ) => void = () => void 0;

  protected _index: number = 0;
  protected _blockers = createEvents<Blocker>();

  // ### implemented by sub-classes ###
  // base interface
  protected abstract getIndexAndLocation(): [number /* index */, Location];
  abstract setup(): void;

  // history interface
  /**
   * Jump to the specified route
   * ```ts
   * router.push("/list");
   * router.push("/list?a=b");
   * router.push({
   *   pathname: "/list",
   *   search: "?a=b"
   * })
   * ```
   */
  abstract push(to: PathRecord, options: PushOptions): void;
  /**
   *  Jump to the specified route and replace the current history record
   */
  abstract replace(to: PathRecord, options?: PushOptions): void;
  /**
   * Jump to the specified route by number
   */
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
      href: pathToString(toPath, this.basename)
    };
  }

  transitionTo(
    to: PathRecord,
    {
      onTransition,
      onAbort,
      action = ACTION_PUSH,
      state = null,
      redirectedFrom,
      skipGuards
    }: TransitionOptions
  ) {
    const { path } = this.resolve(to, this.location.pathname);
    const nextLocation = createLocation(path, { state, redirectedFrom });

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
            redirectedFrom,
            skipGuards
          });
        }
      });
      return;
    }

    this.doTransition(
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
      onAbort,
      skipGuards,
      action === ACTION_REPLACE,
      redirectedFrom
    );
  }

  private _updateState(nextAction: Action) {
    // update state
    this.action = nextAction;
    [this._index, this.location] = this.getIndexAndLocation();
  }
}
