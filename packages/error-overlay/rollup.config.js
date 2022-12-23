import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import ts from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import { string } from 'rollup-plugin-string';

const extensions = ['.js', '.ts', '.tsx', 'jsx'];

export default {
  input: path.join(__dirname, 'src/index.ts'),

  plugins: [
    alias({
      entries: [
        {
          find: 'iframeScript',
          replacement: path.resolve(__dirname, './lib/iframe-bundle.js')
        }
      ]
    }),
    string({
      include: path.resolve(__dirname, './lib/iframe-bundle.js')
    }),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    resolve({ extensions }),
    ts({
      tsconfig: path.join('./tsconfig.build.json'),
      declaration: false
    }),
    commonjs({ extensions })
  ],
  output: {
    name: 'ErrorOverlay',
    file: path.join(__dirname, './umd/index.js'),
    format: 'umd'
  }
};
