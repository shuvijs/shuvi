export function middleware(req, res, next) {
  res.setHeader('mh', res.getHeader('mh') + '-id');
  next();
}
