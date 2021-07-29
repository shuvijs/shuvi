import path from 'path';
const runtimeCoreDir = path.dirname(
  require.resolve('@shuvi/runtime-core/package.json')
);

export default (...paths: string[]) => {
  const filePath = `${path.join(runtimeCoreDir, 'lib', ...paths)}`;
  try {
    require.resolve(filePath);
  } catch {
    throw new Error(
      `[shuvi-app building] Module under @shuvi/runtime-core does not exist (${filePath}). Please check the file path is correct.`
    );
  }
  return filePath;
};
