import { sleep } from '../utils';
export default async function user(req, res, next) {
  await sleep(2000);
  res.statusCode = 200;
  res.end({ user: 'hello' });
}
