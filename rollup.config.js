import node from 'rollup-plugin-node-resolve';

export default {
    input: 'src/alloy',
    plugins: [node()],
    output: {
        file: 'public/js/alloy.js',
        format: 'umd',
        name: 'alloy',
        indent: false,
        globals: {
            d3: 'd3'
        }
    },
    external: ['d3']
}

// export default {
//     input: 'simple/alloy',
//     plugins: [node()],
//     output: {
//         file: 'public/js/alloy-simple.js',
//         format: 'umd',
//         name: 'alloy',
//         indent: false,
//         globals: {
//             d3: 'd3'
//         }
//     },
//     external: ['d3']
// }