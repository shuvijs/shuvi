export default function setHeader(req, res) {
  res.setHeader('shuvi-custom-header', 'bar');
  res.end('200 OK');
}
