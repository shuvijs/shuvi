export function render(renderAppToString, appContext) {
  if (appContext.notFound) {
    return '404 Custom HTML';
  }
  return renderAppToString();
}

export function onViewDone(req, res, { html, appContext }) {
  if (appContext.notFound) {
    res.statusCode = 404;
    res.end(html);
  }
}
