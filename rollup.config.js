import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default {
  input: 'lib/index.js',
  output: {
    file: pkg.main,
    format: 'cjs',
  },
  external: [...Object.keys(pkg.dependencies), 'fs', 'path'],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
