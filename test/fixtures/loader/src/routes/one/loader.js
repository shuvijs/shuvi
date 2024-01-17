import { sleep } from '../../utils';
import { url } from '../../app';

export const loader = async ({ query }) => {
  await sleep(3000);
  return {
    query,
    time: 1,
    url
  };
};
