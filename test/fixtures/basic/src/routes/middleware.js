export default function middleware(req, res, next) {
  console.log('root req.url ', req.url);
  next();
}
