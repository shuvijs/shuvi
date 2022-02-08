export function render() {
  const error = new Error('Something wrong');
  error.statusCode = 501;
  throw error;
}
