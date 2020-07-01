export function onViewDone(req, res, { html, appContext }) {
  if (appContext.notFound) {
    res.statusCode = 404;
    res.end(html);
  }
}
