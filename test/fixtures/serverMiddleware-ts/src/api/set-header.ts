import { Runtime } from '@shuvi/types';

const setHeader: Runtime.IServerAppMiddleware = async (ctx, next) => {
  ctx.response.set('shuvi-middleware-custom-header', 'bar');
  await next();
};

export default setHeader;
