export default function healthCheck(req, res, next) {
  res.statusCode = 200;
  res.end('200 OK');
}
