export default function middleware(req, res, next) {
  console.log('[local]=>deep=>[[...other]]=>req.url ', req.url);
  next();
}
