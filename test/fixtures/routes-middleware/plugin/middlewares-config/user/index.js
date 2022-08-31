export default function user(req, res, next) {
  res.statusCode = 200;
  res.end(req.params.id.join(','));
}
