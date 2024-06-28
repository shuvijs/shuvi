import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import ts from '@rollup/plugin-typescript';

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
    resolve({ extensions }),
    ts({
      tsconfig: path.join('./tsconfig.build.rollup.json'),
      declaration: false
    }),
    commonjs({ extensions })
  ],
  output: {
    compact: false,
    file: path.join(__dirname, './lib/iframe-bundle.js'),
    format: 'iife'
  }
};
