export default function setHeader(req, res, next) {
  res.setHeader('shuvi-middleware-custom-header', 'bar');
  next();
}
