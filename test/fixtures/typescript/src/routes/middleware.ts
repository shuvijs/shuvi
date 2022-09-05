import { ShuviMiddlewareHandler } from '@shuvi/runtime/server';

const middleware: ShuviMiddlewareHandler = (req, res, next) => {
  if (req.query.middleware) {
    return res.end('middleware success');
  }
  next();
};

export default middleware;
