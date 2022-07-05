export function middleware(req, res, next) {
  res.setHeader('in-a1', '1');
  next();
}
