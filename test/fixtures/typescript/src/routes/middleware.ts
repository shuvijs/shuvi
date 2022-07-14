import { MiddlewareHandler } from '@shuvi/runtime';

const middleware: MiddlewareHandler = (req, res, next) => {
  if (req.query.middleware) {
    return res.end('middleware success');
  }
  next();
};

export default middleware;
