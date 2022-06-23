import type { RuntimeServer } from '@shuvi/runtime';

const apiHandler: RuntimeServer.IApiRequestHandler = function handler(
  req,
  res
) {
  res.status(200).json({ data: 'apis index success' });
};
export default apiHandler;
