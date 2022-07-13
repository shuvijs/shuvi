export default function middleware(req, res, next) {
  console.log('[local] req.url ', req.url);
  next();
}
