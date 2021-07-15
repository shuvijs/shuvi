const Koa = require('koa');
const { shuvi } = require('../../../packages/shuvi/lib/index');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const config = process.env.CONFIGOVERRIDES
  ? JSON.parse(process.env.CONFIGOVERRIDES)
  : {};
const app = shuvi({
  dev,
  cwd: __dirname,
  config
});

app.prepare().then(() => {
  const server = new Koa();
  const handle = app.getRequestHandler();

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    next();
  });

  // server.use(async (ctx, next) => {
  //   ctx.res.statusCode = 200
  //   await next()
  // })

  server.listen(port, () => {
    console.log(`> Koa server Ready on http://localhost:${port}`);
  });
});
