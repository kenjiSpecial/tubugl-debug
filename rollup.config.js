// https://github.com/rollup/rollup
// https://github.com/rollup/rollup-starter-lib
// https://github.com/rollup

import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

// console.log('library name' + pkg.libName + ', version: ' + pkg.version);
function glsl() {

    return {

        transform(code, id) {

            if (/\.glsl$/.test(id) === false) return;

            var transformedCode = 'export default ' + JSON.stringify(
                code
                .replace(/[ \t]*\/\/.*\n/g, '') // remove //
                .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '') // remove /* */
                .replace(/\n{2,}/g, '\n') // # \n+ to \n
            ) + ';';
            return {
                code: transformedCode,
                map: {
                    mappings: ''
                }
            };

        }

    };

}

export default [
	// browser-friendly UMD build
	{
		input: './src/index.js',
		output: {
			name: pkg.libName,
			file: pkg.main,
			format: 'umd'
		},
		plugins: [
			glsl(),
			babel(babelrc()),
			// resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	},
	{
		input: './src/index.js',
		output: [{ file: pkg.cjs, format: 'cjs' }],
		plugins: [
			glsl(),
			babel(babelrc())
		]
	},
	{
		input: './src/index.js',
		output: [{ file: pkg.module, format: 'es' }],
		plugins: [glsl()]
	}
];
