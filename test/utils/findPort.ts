import getPort from 'get-port';

export async function findPort(): Promise<number> {
  return await getPort();
}
