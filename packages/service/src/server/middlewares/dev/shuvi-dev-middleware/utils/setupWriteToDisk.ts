import * as fs from 'fs';
import * as path from 'path';

import { IContext } from '../types';

export default function setupWriteToDisk(context: IContext) {
  const compilers = context.compiler.compilers;

  for (const compiler of compilers) {
    compiler.hooks.emit.tap('DevMiddleware', () => {
      // @ts-ignore
      if (compiler.hasShuviDevMiddlewareAssetEmittedCallback) {
        return;
      }

      compiler.hooks.assetEmitted.tapAsync(
        'DevMiddleware',
        (_file, info, callback) => {
          const { targetPath, content } = info;

          const dir = path.dirname(targetPath);

          return fs.mkdir(dir, { recursive: true }, mkdirError => {
            if (mkdirError) {
              console.log(
                `Unable to write "${dir}" directory to disk:\n${mkdirError}`
              );

              return callback(mkdirError);
            }

            return fs.writeFile(targetPath, content, writeFileError => {
              if (writeFileError) {
                console.log(
                  `Unable to write "${targetPath}" asset to disk:\n${writeFileError}`
                );
                return callback(writeFileError);
              }

              return callback();
            });
          });
        }
      );
      // @ts-ignore
      compiler.hasShuviDevMiddlewareAssetEmittedCallback = true;
    });
  }
}
