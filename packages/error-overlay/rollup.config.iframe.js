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
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
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
    name: 'iframe-bundle',
    file: path.join(__dirname, './lib/iframe-bundle.js')
  }
};
