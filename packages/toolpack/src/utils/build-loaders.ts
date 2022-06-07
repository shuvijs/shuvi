import { resolveFile } from '@shuvi/utils/lib/file';
import * as esbuild from 'esbuild';
import * as path from 'path';

const loader: { [ext: string]: esbuild.Loader } = {
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.ts': 'ts',
  '.tsx': 'tsx'
};

export async function build(dir: string, mode: string) {
  await esbuild.build({
    entryPoints: [path.join(dir, 'loaders.js')],
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    loader,
    watch: mode === 'development',
    bundle: true,
    logLevel: 'error',
    external: ['react', '@shuvi/*'],
    pure: ['loader'],
    treeShaking: true,
    outfile: path.join(dir, 'loaders-build.js'),
    plugins: [
      {
        name: 'imports',
        setup(build) {
          let entry: string | undefined;
          build.onResolve({ filter: /.*/ }, args => {
            if (args.kind === 'entry-point') entry = args.path;
            if (args.kind === 'entry-point' || args.importer === entry) {
              const resolved = resolveFile(
                path.resolve(args.resolveDir, args.path)
              );
              return { path: resolved };
            }
            return {
              path:
                !args.path.startsWith('.') && !args.path.startsWith('/')
                  ? args.path
                  : path.resolve(args.resolveDir, args.path),
              external: true,
              sideEffects: false
            };
          });
        }
      }
    ]
  });
}

export async function buildToString(entry: string) {
  const result = await esbuild.build({
    entryPoints: [entry],
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    loader,
    bundle: true,
    logLevel: 'error',
    external: ['react', '@shuvi/*'],
    pure: ['loader'],
    treeShaking: true,
    outdir: 'out',
    write: false,
    plugins: [
      {
        name: 'imports',
        setup(build) {
          let entry: string | undefined;
          build.onResolve({ filter: /.*/ }, args => {
            if (args.kind === 'entry-point') entry = args.path;
            if (args.kind === 'entry-point' || args.importer === entry) {
              const resolved = resolveFile(
                path.resolve(args.resolveDir, args.path)
              );
              return { path: resolved };
            }
            return {
              path:
                !args.path.startsWith('.') && !args.path.startsWith('/')
                  ? args.path
                  : path.resolve(args.resolveDir, args.path),
              external: true,
              sideEffects: false
            };
          });
        }
      }
    ]
  });
  return result.outputFiles[0]?.text;
}
