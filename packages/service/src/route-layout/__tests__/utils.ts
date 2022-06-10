import { join } from 'path';

export const getFixturePath = (
  fixturePath: string,
  dirname: string = __dirname
) => {
  return join(dirname, 'fixtures', fixturePath);
};
