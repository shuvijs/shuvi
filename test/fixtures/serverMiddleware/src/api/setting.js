export default async function setting(ctx) {
  ctx.status = 200;
  ctx.body = ctx.req.matchedPath.params;
};
