export function isError(err: any): err is Error {
  return Object.prototype.toString.call(err).indexOf('Error') > -1;
}

export function isFunction(func: any): func is Function {
  return Object.prototype.toString.call(func).indexOf('Function') > -1;
}
