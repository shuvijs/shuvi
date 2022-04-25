// modified from https://github.com/egoist/bundle-require/blob/dd96549a9b995d6a827baee022eb324fd2fac2ef/src/index.ts

import fs from 'fs/promises';
import path from 'path';
import {
  build,
  Loader,
  BuildOptions,
  BuildResult,
  Plugin as EsbuildPlugin
} from 'esbuild';

const PATH_SEG_RE = /\/|\\/g;

const CACHE_DIR = path.join(process.cwd(), './node_modules/.bundle-require');

function inferLoader(ext: string): Loader {
  if (ext === '.mjs' || ext === '.cjs') return 'js';
  return ext.slice(1) as Loader;
}

export const JS_EXT_RE = /\.(mjs|cjs|ts|js|tsx|jsx)$/;

export type GetOutputFile = (filepath: string) => string;

export interface Options {
  cwd?: string;
  /**
   * esbuild options
   */
  esbuildOptions?: BuildOptions;
  /**
   * Get the path to the output file
   * By default we simply replace the extension with `.bundled.js`
   */
  getOutputFile?: GetOutputFile;

  /** External packages */
  external?: (string | RegExp)[];

  /**
   * Preserve compiled temporary file for debugging
   * Default to `process.env.BUNDLE_REQUIRE_PRESERVE`
   */
  preserveTemporaryFile?: boolean;
}

const defaultGetOutputFile = (filepath: string) =>
  path.join(
    CACHE_DIR,
    filepath
      .replace(PATH_SEG_RE, '_')
      .replace(JS_EXT_RE, `.bundled_${Date.now()}.cjs`)
  );

export const match = (id: string, patterns?: (string | RegExp)[]) => {
  if (!patterns) return false;
  return patterns.some(p => {
    if (p instanceof RegExp) {
      return p.test(id);
    }
    return id === p || id.startsWith(p + '/');
  });
};

/**
 * An esbuild plugin to mark node_modules as external
 */
export const externalPlugin = ({
  external,
  notExternal
}: {
  external?: (string | RegExp)[];
  notExternal?: (string | RegExp)[];
} = {}): EsbuildPlugin => {
  return {
    name: 'bundle-require:external',
    setup(ctx) {
      ctx.onResolve({ filter: /.*/ }, async args => {
        if (args.path[0] === '.' || path.isAbsolute(args.path)) {
          // Fallback to default
          return;
        }

        if (match(args.path, external)) {
          return {
            external: true
          };
        }

        if (match(args.path, notExternal)) {
          // Should be resolved by esbuild
          return;
        }

        // Most like importing from node_modules, mark external
        return {
          external: true
        };
      });
    }
  };
};

export const replaceDirnamePlugin = (): EsbuildPlugin => {
  return {
    name: 'bundle-require:replace-path',
    setup(ctx) {
      ctx.onLoad({ filter: JS_EXT_RE }, async args => {
        const contents = await fs.readFile(args.path, 'utf-8');
        return {
          contents: contents
            .replace(/[^"'\\]\b__filename\b[^"'\\]/g, match =>
              match.replace('__filename', JSON.stringify(args.path))
            )
            .replace(/[^"'\\]\b__dirname\b[^"'\\]/g, match =>
              match.replace(
                '__dirname',
                JSON.stringify(path.dirname(args.path))
              )
            )
            .replace(/[^"'\\]\bimport\.meta\.url\b[^"'\\]/g, match =>
              match.replace(
                'import.meta.url',
                JSON.stringify(`file://${args.path}`)
              )
            ),
          loader: inferLoader(path.extname(args.path))
        };
      });
    }
  };
};

export async function bundleRequire(filepath: string, options: Options = {}) {
  if (!JS_EXT_RE.test(filepath)) {
    throw new Error(`${filepath} is not a valid JS file`);
  }

  const cwd = options.cwd || process.cwd();
  const getOutputFile = options.getOutputFile || defaultGetOutputFile;
  const outfile = getOutputFile(filepath);
  const preserveTemporaryFile =
    options.preserveTemporaryFile ?? !!process.env.BUNDLE_REQUIRE_PRESERVE;

  const extractResult = async (result: BuildResult) => {
    let mod: any;
    try {
      mod = await require(outfile);
    } finally {
      if (!preserveTemporaryFile) {
        // Remove the outfile after executed
        await fs.unlink(outfile);
      }
    }

    return mod;
  };

  const result = await build({
    ...options.esbuildOptions,
    entryPoints: [filepath],
    absWorkingDir: cwd,
    outfile,
    format: 'cjs',
    platform: 'node',
    sourcemap: 'inline',
    bundle: true,
    metafile: true,
    write: true,
    watch: false,
    plugins: [
      ...(options.esbuildOptions?.plugins || []),
      externalPlugin({
        external: options.external
      }),
      replaceDirnamePlugin()
    ]
  });

  return extractResult(result);
}
