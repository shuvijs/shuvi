export function onViewDone() {
  const error = new Error('Something wrong');
  error.statusCode = 501;
  throw error;
}
