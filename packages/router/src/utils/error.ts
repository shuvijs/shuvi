export function isError(err: any): err is Error {
  return Object.prototype.toString.call(err).indexOf('Error') > -1;
}
