export function middleware(req, res, next) {
  res.setHeader('mh', 'root');
  next();
}
