module.exports = {
    env: {
        browser: false,
        es2021: true,
        node: true,
        mocha: true
    },
    extends: [ 'eslint:recommended' ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [ ],
    rules: {
        'no-unused-vars': [2, {
            vars: 'local',
            args: 'after-used',
            varsIgnorePattern: '^_\\S',
            argsIgnorePattern: '^_\\S'
        }],

        'max-len': ['error', 100, 4],

        'no-extra-semi': 2,
        'semi': [ 2, 'always' ],
        'no-irregular-whitespace': 2,
        'no-multi-spaces': 2,
        'no-mixed-spaces-and-tabs': 2,
        'no-spaced-func': 2,
        'no-trailing-spaces': 2,
        'space-before-blocks': [ 2, 'always' ],
        'space-infix-ops': 2,
        'space-unary-ops': 2,
        'spaced-comment': [ 2, 'always' ],
        'wrap-regex': 2,
        'template-curly-spacing': [ 'error', 'never' ]
    },
    settings: { }
};
