// source: https://github.com/sindresorhus/resolve-from
import fs from 'fs';
import path from 'path';
import isError from './is-error';

const Module = require('module');

export const resolveFrom = (
  fromDirectory: string,
  moduleId: string,
  silent?: boolean
) => {
  if (typeof fromDirectory !== 'string') {
    throw new TypeError(
      `Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDirectory}\``
    );
  }

  if (typeof moduleId !== 'string') {
    throw new TypeError(
      `Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``
    );
  }

  try {
    fromDirectory = fs.realpathSync(fromDirectory);
  } catch (error: unknown) {
    if (isError(error) && (error as { code: string }).code === 'ENOENT') {
      fromDirectory = path.resolve(fromDirectory);
    } else if (silent) {
      return;
    } else {
      throw error;
    }
  }

  const fromFile = path.join(fromDirectory, 'noop.js');

  const resolveFileName = () =>
    Module._resolveFilename(moduleId, {
      id: fromFile,
      filename: fromFile,
      paths: Module._nodeModulePaths(fromDirectory)
    });

  if (silent) {
    try {
      return resolveFileName();
    } catch (error) {
      return;
    }
  }

  return resolveFileName();
};
