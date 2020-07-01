export function onViewDone(req, res, { appContext }) {
  if (appContext.notFound) {
    res.statusCode = 404;
    res.end();
  }
}
