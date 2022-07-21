import { createFsFromVolume, Volume } from 'memfs';

import { IContext } from '../types';

export default function setupOutputFileSystem(context: IContext) {
  const outputFileSystem = createFsFromVolume(new Volume());

  const compilers = context.compiler.compilers;

  for (const compiler of compilers) {
    compiler.outputFileSystem = outputFileSystem;
  }
  // @ts-ignore
  context.outputFileSystem = outputFileSystem;
}
