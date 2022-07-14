export default function setCookie(req, res, next) {
  res.setHeader('Set-Cookie', [
    'shuvi-middleware-custom-cookie=foo; path=/; httponly'
  ]);
  next();
}
