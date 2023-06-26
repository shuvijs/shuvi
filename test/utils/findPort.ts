import { checkPort, getRandomPort } from 'get-port-please';

export async function findPort(): Promise<number> {
  const result = await getRandomPort();
  if (await checkPort(result)) {
    return result;
  }

  return await findPort();
}
