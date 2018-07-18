const resolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs'),
    babel = require('rollup-plugin-babel'),
    typescript = require('rollup-plugin-typescript');

const pkg = require('./package.json');

module.exports = [
    // browser-friendly UMD build
    {
        input: './src/index.ts',
        output: [{
            file: pkg.browser,
            format: 'umd',
            name: 'viewjs.rest',
            globals: {
                '@viewjs/events': 'viewjs.events',
                '@viewjs/utils': 'viewjs.utils',
                '@viewjs/models': 'viewjs.models',
                'fetchain': "fetchain"
            }
        }, {
            file: pkg.module,
            format: 'es'
        }],
        external: [
            "@viewjs/events",
            "@viewjs/utils",
            '@viewjs/models',
            'fetchain'
        ],
        plugins: [
            typescript({
                typescript: require('typescript')
            }),
            // resolve(), // so Rollup can find `ms`
            // commonjs(), // so Rollup can convert `ms` to an ES module
            babel({
                //presets: ['env'],
                exclude: ['node_modules/**'],

            })
        ]
    },

];