import type { RuntimeServer } from '@shuvi/runtime'

export const middleware: RuntimeServer.IRequestHandlerWithNext = function (req, res, next) {
  if(req.pathname === '/middleware'){
    return res.end('middleware success');
  }
  next();
}
