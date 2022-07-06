export function middleware(req, res, next) {
  const mOrder = res.getHeader('m-order') || '';
  res.setHeader('m-order', mOrder + '-a');
  res.setHeader('in-a', '1');
  next();
}
