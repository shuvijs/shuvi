export default async function setHeader(ctx, next) {
  ctx.response.set('shuvi-middleware-custom-header', 'bar');
  await next();
};