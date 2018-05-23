// Since we're using the minified hljs, function names and keys need to
// be replaced with their minified version, found here:
// https://github.com/isagalaev/highlight.js/blob/master/tools/utility.js
hljs.registerLanguage('alloy', function () {

    let NUMBER_RE = '\\b\\d+';

    return {
        // case_insensitive
        cI: true,

        // keywords
        k: 'abstract all and as assert but check disj ' +
        'else exactly extends fact for fun iden iff implies ' +
        'in Int let lone module no none not one open or pred ' +
        'run set sig some sum univ',

        // contains
        c: [

            // hljs.COMMENT
            hljs.C('//', '$'),
            hljs.C('--', '$'),
            hljs.C('/\\*', '\\*/'),

            {
                // className
                cN: 'number',
                // begin
                b: NUMBER_RE,
                // relevance
                r: 0
            }
        ]
    };
});