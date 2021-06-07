export { default as NOOP } from './noopFn';
export * from './defer';

export const EMPTY_OBJ = {};

export const extend = Object.assign;

export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key);
