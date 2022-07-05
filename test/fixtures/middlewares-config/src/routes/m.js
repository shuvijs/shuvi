export function middleware(req, res, next) {
  res.setHeader('in-index', '1');
  next();
}
