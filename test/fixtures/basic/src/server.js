export const serverMiddleware = [
  {
    path: '/hmr/serverMiddleware',
    handler: ctx => {
      ctx.body = 'body_content';
    }
  }
];
