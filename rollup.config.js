import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // UMD build (for browser use via script tag)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/html-docx-mini.js',
      format: 'umd',
      name: 'HtmlDocxMini',
      globals: {}
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // Minified UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/html-docx-mini.min.js',
      format: 'umd',
      name: 'HtmlDocxMini',
      globals: {}
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser()
    ]
  },
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/html-docx-mini.esm.js',
      format: 'es'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // CommonJS build (for Node.js)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/html-docx-mini.cjs.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins: [
      resolve({
        browser: false,
        preferBuiltins: true
      }),
      commonjs()
    ]
  }
];