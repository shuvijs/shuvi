import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from 'rollup-plugin-typescript2';

const extensions = ['.js', '.ts', '.tsx','jsx'];

export default {

  input: path.join(__dirname, 'src/index.ts'),

  plugins: [

    commonjs({

    }),
    resolve({ extensions }),

    ts({
      tsconfig: path.join('./tsconfig.build.json'),
      extensions
    }),

  ],
  output: {
    name: 'ErrorOverlay',
    file: path.join(__dirname, './umd/index.js'),
    format: 'umd',
  },
};
