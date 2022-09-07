import os from 'os';
import url from 'url';

export const isWindowsSystem = () => os.platform() === 'win32';

export const pathToFileUrl = (path: string) =>
  url.pathToFileURL(path).toString();

export const makeSureSuffix = (filepath: string, suffix: string = 'js') =>
  isWindowsSystem() ? `${filepath}.${suffix}` : filepath;
