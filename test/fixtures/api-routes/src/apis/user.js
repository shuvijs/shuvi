export default function user(req, res) {
  res.status = 200;
  res.end(req.params.id);
}
