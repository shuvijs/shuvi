export function onViewDone(ctx, { html, appContext }) {
  if (appContext.notFound) {
    ctx.status = 404;
    ctx.body = html;
  }
}
