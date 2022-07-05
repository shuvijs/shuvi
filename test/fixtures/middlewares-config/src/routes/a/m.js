export function middleware(req, res, next) {
  res.setHeader('in-a', '1');
  next();
}
