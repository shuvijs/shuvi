export const checkNotInNodeModules = (
  libraryName: string,
  rootDir: string
): boolean => {
  try {
    require.resolve(libraryName, {
      paths: [rootDir]
    });
    return false;
  } catch (e) {
    return true;
  }
};
