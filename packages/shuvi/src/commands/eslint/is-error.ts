/* eslint-disable @typescript-eslint/no-explicit-any */
// We allow some additional attached properties for Errors
export interface ShuviError extends Error {
  type?: string;
  page?: string;
  code?: string | number;
  cancelled?: boolean;
}

export default function isError(err: unknown): err is ShuviError {
  return (
    typeof err === 'object' && err !== null && 'name' in err && 'message' in err
  );
}

export function getProperError(err: unknown): Error {
  if (isError(err)) {
    return err;
  }

  return new Error(isPlainObject(err) ? JSON.stringify(err) : `${err}`);
}

function getObjectClassLabel(value: any): string {
  return Object.prototype.toString.call(value);
}

function isPlainObject(value: any): boolean {
  if (getObjectClassLabel(value) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  /**
   * this used to be previously:
   *
   * `return prototype === null || prototype === Object.prototype`
   *
   * but Edge Runtime expose Object from vm, being that kind of type-checking wrongly fail.
   *
   * It was changed to the current implementation since it's resilient to serialization.
   */
  return prototype === null || prototype.hasOwnProperty('isPrototypeOf');
}
