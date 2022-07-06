export function middleware(req, res, next) {
  const mOrder = res.getHeader('m-order') || '';
  res.setHeader('m-order', mOrder + '-a1');
  res.setHeader('in-a1', '1');
  next();
}
