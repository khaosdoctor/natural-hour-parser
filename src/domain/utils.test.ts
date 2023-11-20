import { capitalize } from './utils.js'

describe('capitalize', () => {
	it('should capitalize the first letter of a string', () => {
		expect(capitalize('hello')).toBe('Hello')
		expect(capitalize('world')).toBe('World')
	})

	it('should handle empty string', () => {
		expect(capitalize('')).toBe('')
	})
})
