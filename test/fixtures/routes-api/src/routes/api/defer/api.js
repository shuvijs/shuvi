export default function defer(req, res) {
  setTimeout(function () {
    res.status = 200;
    res.end('defer OK');
  }, 3000);
}
