import { ParsedQuery } from 'query-string';
import { IRoute } from './router';

export type GlobalHistory = typeof window.history;

/**
 * Actions represent the type of change to a location value.
 *
 */
export type Action = 'Pop' | 'Push' | 'Replace';

/**
 * A URL pathname, beginning with a /.
 *
 */
export type Pathname = string;

/**
 * A URL search string, beginning with a ?.
 *
 */
export type Search = string;

/**
 * A URL fragment identifier, beginning with a #.
 *
 */
export type Hash = string;

/**
 * An object that is used to associate some arbitrary data with a location, but
 * that does not appear in the URL path.
 *
 */
export type State = object | null;

export type HistoryState = {
  usr: State;
  key?: string;
  idx: number;
};

/**
 * A unique string associated with a location. May be used to safely store
 * and retrieve data in some other storage API, like `localStorage`.
 *
 */
export type Key = string;

/**
 * The pathname, search, and hash values of a URL.
 */
export interface Path {
  /**
   * A URL pathname, beginning with a /.
   *
   */
  pathname: Pathname;

  /**
   * The parsed URL search Object.
   *
   */
  query: ParsedQuery;

  /**
   * A URL search string, beginning with a ?.
   *
   */
  search: Search;

  /**
   * A URL fragment identifier, beginning with a #.
   *
   */
  hash: Hash;
}

/**
 * A partial Path object that may be missing some properties.
 */
export interface PartialPath {
  /**
   * The URL pathname, beginning with a /.
   *
   */
  pathname?: Pathname;

  /**
   * The parsed URL search Object.
   *
   */
  query?: ParsedQuery;

  /**
   * The URL search string, beginning with a ?.
   *
   */
  search?: Search;

  /**
   * The URL fragment identifier, beginning with a #.
   *
   */
  hash?: Hash;
}

/**
 * An entry in a history stack. A location contains information about the
 * URL path, as well as possibly some arbitrary state and a key.
 *
 */
export interface Location<S extends State = State> extends Path {
  /**
   * An object of arbitrary data associated with this location.
   *
   */
  state: S;

  /**
   * A unique string associated with this location. May be used to safely store
   * and retrieve data in some other storage API, like `localStorage`.
   *
   * Note: This value is always "default" on the initial location.
   *
   */
  key: Key;
}

/**
 * A partial Location object that may be missing some properties.
 */
export interface PartialLocation<S extends State = State> extends PartialPath {
  /**
   * An object of arbitrary data associated with this location.
   *
   */
  state?: S;

  /**
   * A unique string associated with this location. May be used to safely store
   * and retrieve data in some other storage API, like `localStorage`.
   *
   * Note: This value is always "default" on the initial location.
   *
   */
  key?: Key;
}

/**
 * A change to the current location.
 */
export interface Update<S extends State = State> {
  /**
   * The action that triggered the change.
   */
  action: Action;

  /**
   * The new location.
   */
  location: Location<S>;
}

/**
 * A function that receives notifications about location changes.
 */
export interface Listener<S extends State = State> {
  (update: Update<S>): void;
}

export interface NavigationGuardHook {
  (
    to: IRoute,
    from: IRoute,
    next: (
      nextObject?: false | string | { path?: string; replace?: boolean } | Error
    ) => void
  ): void;
}

export interface NavigationResolvedHook {
  (to: IRoute, from: IRoute): void;
}

/**
 * A change to the current location that was blocked. May be retried
 * after obtaining user confirmation.
 */
export interface Transition<S extends State = State> extends Update<S> {
  /**
   * Retries the update to the current location.
   */
  retry(): void;
}

/**
 * A function that receives transitions when navigation is blocked.
 */
export interface Blocker<S extends State = State> {
  (tx: Transition<S>): void;
}

/**
 * Describes a location that is the destination of some navigation, either via
 * `history.push` or `history.replace`. May be either a URL or the pieces of a
 * URL path.
 */
export type To = string | PartialPath;

export interface ResolvedPath {
  path: Path;
  href: string;
}

/**
 * A history is an interface to the navigation stack. The history serves as the
 * source of truth for the current location, as well as provides a set of
 * methods that may be used to change it.
 *
 * It is similar to the DOM's `window.history` object, but with a smaller, more
 * focused API.
 */
export interface History<S extends State = State> {
  /**
   * The last action that modified the current location. This will always be
   * Action.Pop when a history instance is first created. This value is mutable.
   *
   */
  readonly action: Action;

  /**
   * The current location. This value is mutable.
   *
   */
  readonly location: Location<S>;

  /**
   * Returns a valid href for the given `to` value that may be used as
   * the value of an <a href> attribute.
   *
   * @param to - The destination URL
   *
   */
  resolve(to: To, from?: string): ResolvedPath;

  /**
   * Pushes a new location onto the history stack, increasing its length by one.
   * If there were any entries in the stack after the current one, they are
   * lost.
   *
   * @param to - The new URL
   * @param state - Data to associate with the new location
   *
   */
  push(to: To, state?: S): void;

  /**
   * Replaces the current location in the history stack with a new one.  The
   * location that was replaced will no longer be available.
   *
   * @param to - The new URL
   * @param state - Data to associate with the new location
   *
   */
  replace(to: To, state?: S): void;

  /**
   * Navigates `n` entries backward/forward in the history stack relative to the
   * current index. For example, a "back" navigation would use go(-1).
   *
   * @param delta - The delta in the stack index
   *
   */
  go(delta: number): void;

  /**
   * Navigates to the previous entry in the stack. Identical to go(-1).
   *
   * Warning: if the current location is the first location in the stack, this
   * will unload the current document.
   *
   */
  back(): void;

  /**
   * Navigates to the next entry in the stack. Identical to go(1).
   *
   */
  forward(): void;

  /**
   * Sets up a listener that will be called whenever the current location
   * changes.
   *
   * @param listener - A function that will be called when the location changes
   * @returns unlisten - A function that may be used to stop listening
   *
   */
  listen(listener: Listener<S>): () => void;

  /**
   * Prevents the current location from changing and sets up a listener that
   * will be called instead.
   *
   * @param blocker - A function that will be called when a transition is blocked
   * @returns unblock - A function that may be used to stop blocking
   *
   */
  block(blocker: Blocker<S>): () => void;

  onTransistion(to: To, afterResolved: () => void): void;
}
