import path from 'path';
const runtimeCoreDir = path.dirname(
  require.resolve('@shuvi/platform-core/package.json')
);

export default (...paths: string[]) => {
  const filePath = `${path.join(runtimeCoreDir, 'lib', ...paths)}`;
  try {
    require.resolve(filePath);
  } catch {
    throw new Error(
      `[shuvi-app building] Module under @shuvi/platform-core does not exist (${filePath}). Please check the file path is correct.`
    );
  }
  return filePath;
};
