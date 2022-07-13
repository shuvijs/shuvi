// FIXME: `RuntimeServer` export
/* import type { RuntimeServer } from '@shuvi/runtime';
 */

const middleware /* : RuntimeServer.IRequestHandlerWithNext */ = (
  req,
  res,
  next
) => {
  if (req.query.middleware) {
    return res.end('middleware success');
  }
  next();
};

export default middleware;
