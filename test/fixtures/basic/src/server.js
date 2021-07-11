export const serverMiddleware = [
  {
    path: '/hmr/serverMiddleware',
    handler: (req, res, next) => {
      res.end('body_content');
    }
  }
];
