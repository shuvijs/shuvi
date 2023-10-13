import { ParsedQuery } from 'query-string';
import History from '../history/base';

export { History, ParsedQuery };

export type GlobalHistory = typeof window.history;

/**
 * Actions represent the type of change to a location value.
 *
 */
export type Action = 'POP' | 'PUSH' | 'REPLACE';

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
} | null;

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
  redirectedFrom?: Path;

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
export type PathRecord = string | PartialPath;

export interface ResolvedPath {
  path: Path;
  href: string;
}

export type RemoveListenerCallback = () => void | undefined;
