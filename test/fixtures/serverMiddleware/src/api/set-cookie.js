export default async function setCookie(ctx, next) {
  ctx.cookies.set('shuvi-middleware-custom-cookie', 'foo');
  await next();
}
