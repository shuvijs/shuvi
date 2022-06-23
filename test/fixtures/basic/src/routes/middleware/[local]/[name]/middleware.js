export function middleware(req, res, next) {
  console.log('[local]=>name=>req.url ', req.url);
  if (req.query.name) {
    res.statusCode = 200;
    res.end('when req.query.name true return earlier');
  } else {
    next();
  }
}
