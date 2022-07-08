import { join } from 'path';

export const checkNotInNodeModules = (
  libraryName: string,
  rootDir: string
): boolean => {
  try {
    require.resolve(libraryName, {
      paths: [rootDir, join(__dirname, '../../')]
    });
    return false;
  } catch (e) {
    return true;
  }
};
