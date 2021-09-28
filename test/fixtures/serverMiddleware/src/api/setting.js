export default function setting(req, res, next) {
  res.statusCode = 200;
  res.end(JSON.stringify(req.params));
}
