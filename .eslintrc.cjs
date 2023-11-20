module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: ['standard-with-typescript', 'prettier'],
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
		{
			files: ['src/**/*.test.*'],
			rules: {
				// Disabled due to that the test files are not compiled
				// And all the describes and it will return a promise
				// that's handled by the runner itself
				'@typescript-eslint/no-floating-promises': 'off',
			},
			env: {
				jest: true,
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/strict-boolean-expressions': 'off',
		'@typescript-eslint/return-await': 'off',
	},
}
