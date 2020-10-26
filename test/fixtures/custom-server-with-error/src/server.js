export function onViewDone() {
  const error = new Error('Something wrong');
  error.status = 501;
  throw error;
}
