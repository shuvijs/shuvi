import path from 'path';

export const resolvePluginFile = (plugin: string, ...paths: string[]) =>
  path.resolve(__dirname, '..', '..', '..', 'plugins', plugin, ...paths);

export const resolveRuntimeFile = (plugin: string, ...paths: string[]) =>
  path.resolve(__dirname, '..', '..', '..', 'plugins', plugin, ...paths);
