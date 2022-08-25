import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import ts from 'rollup-plugin-typescript2';

const extensions = ['.js', '.ts', '.tsx', 'jsx'];

export default {
  input: path.join(__dirname, 'src/iframeScript.tsx'),

  plugins: [
    replace({
      delimiters: ['\\b', '\\b'],
      preventAssignment: true,
      values: {
        // We set process.env.NODE_ENV to 'production' so that React is built
        // in production mode.
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        // This prevents our bundled React from accidentally hijacking devtools.
        __REACT_DEVTOOLS_GLOBAL_HOOK__: '({})'
      }
    }),
    commonjs(),
    resolve({ extensions }),

    ts({
      tsconfig: path.join('./tsconfig.build.json'),
      extensions
    })
  ],
  output: {
    compact: false,
    name: 'iframe-bundle',
    file: path.join(__dirname, './lib/iframe-bundle.js')
  }
};
