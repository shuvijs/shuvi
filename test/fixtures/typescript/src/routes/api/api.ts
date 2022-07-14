import { APIHandler } from '@shuvi/runtime';

const apiHandler: APIHandler = function handler(req, res) {
  res.status(200).json({ data: 'apis index success' });
};
export default apiHandler;
