module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ['plugin:@typescript-eslint/recommended'],
    "parser": '@typescript-eslint/parser',
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "ENV": true
    },
    "parserOptions": {
        "ecmaVersion": 11,
        "sourceType": "module"
    },
    "rules": {
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single",
        ],
        'linebreak-style': 'off',
    }
};
