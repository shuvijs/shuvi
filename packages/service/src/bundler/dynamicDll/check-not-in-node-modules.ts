import { join } from 'path';

export const checkNotInNodeModules = (libraryName: string): boolean => {
  try {
    require.resolve(libraryName, {
      paths: [process.cwd(), join(__dirname, '../../')]
    });
    return false;
  } catch (e) {
    return true;
  }
};
