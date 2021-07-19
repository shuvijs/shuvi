export { default as NOOP } from './noopFn';
export * from './defer';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

export const EMPTY_OBJ = {};

export const extend = Object.assign;

export const isArray = Array.isArray;

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function';

export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key);

const objectRegExp = /^\[object (\S+)\]$/;
export function getType(obj: any) {
  var type = typeof obj;

  if (type !== 'object') {
    return type;
  }

  // inspect [[Class]] for objects
  return toString.call(obj).replace(objectRegExp, '$1');
}
