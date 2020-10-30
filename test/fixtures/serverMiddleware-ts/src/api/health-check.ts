import { Runtime } from '@shuvi/types';

const healthCheck: Runtime.IServerAppHandler = async ctx => {
  ctx.status = 200;
  ctx.body = '200 OK';
};

export default healthCheck;
