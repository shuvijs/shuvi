import getPort = require('get-port');

export async function findPort(): Promise<number> {
  return await getPort();
}
