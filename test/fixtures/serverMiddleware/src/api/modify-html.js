export default async function modifyHtml(ctx, next) {
  await next();
  const modified = ctx.body?.replace('$TO_BE_MODIFIED', 'modified');
  ctx.body = modified;
}
