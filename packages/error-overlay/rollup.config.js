import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import ts from 'rollup-plugin-typescript2';

const extensions = ['.js', '.ts', '.tsx'];
export default {
  input: path.join(__dirname, 'src/index.ts'),
  plugins: [
    resolve({ extensions }),
    commonjs(),
    ts({
      tsconfig: path.join('./tsconfig.build.json'),
      extensions
    })
  ],
  output: {
    name: 'ErrorOverlay',
    file: path.join(__dirname, './umd/index.js'),
    format: 'umd',
    globals: {
      'react-dom': 'ReactDOM',
      react: 'React'
    }
  },
  external: ['react', 'react-dom']
};
