export default async function user(ctx) {
  ctx.status = 200;
  ctx.body = ctx.params.id;
};
