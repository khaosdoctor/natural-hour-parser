import debug from 'debug'
import { type AppConfig } from '../config.js'
import { HourParser } from './Parser.js'
import { DomainError } from './errors/DomainError.js'
import { type OpeningHoursInput } from './validation.js'

describe('HourParser', () => {
	beforeEach(() => {
		jest.resetModules()
		jest.restoreAllMocks()
		jest.clearAllMocks()
	})
	const mockConfig = {
		logger: debug('test'),
	} as unknown as AppConfig

	describe('parseOpeningHours', () => {
		it('should throw HTTPError for invalid input', async () => {
			const parser = new HourParser(mockConfig)
			const invalidInput = {
				Monday: [{ type: 'open', value: 3600 }],
			} as unknown as OpeningHoursInput

			try {
				await parser.parseOpeningHours(invalidInput)
			} catch (error) {
				expect(error).toBeInstanceOf(DomainError)
				expect((error as DomainError).message).toMatchInlineSnapshot(
					`"Number of opening and closing hours must match"`
				)
				expect((error as DomainError).status).toBe(422)
			}
		})

		it('should not throw error for valid input', async () => {
			const parser = new HourParser(mockConfig)
			const validInput = {
				monday: [
					{ type: 'open', value: 3600 },
					{ type: 'close', value: 7200 },
				],
			} as unknown as OpeningHoursInput
			expect(parser.parseOpeningHours(validInput)).resolves.not.toThrow()
		})

		it('should parse opening hours correctly unordered with spans in multiple days', async () => {
			const input = {
				monday: [],
				wednesday: [],
				friday: [
					{
						type: 'open',
						value: 36000000,
					},
				],
				thursday: [
					{
						type: 'open',
						value: 37800000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				saturday: [
					{
						type: 'close',
						value: 3600000,
					},
					{
						type: 'open',
						value: 36000,
					},
				],
				sunday: [
					{
						type: 'close',
						value: 3600000,
					},
					{
						type: 'open',
						value: 43200000,
					},
					{
						type: 'close',
						value: 75600000,
					},
				],
				tuesday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 7200000,
					},
					{
						type: 'close',
						value: 64800000,
					},
					{
						type: 'open',
						value: 36000000,
					},
				],
			} as unknown as OpeningHoursInput
			const parser = new HourParser(mockConfig)
			const result = await parser.parseOpeningHours(input)
			expect(result).toMatchInlineSnapshot(`
        {
          "friday": [],
          "monday": [],
          "saturday": [
            {
              "close": 1970-01-01T01:00:00.000Z,
              "open": 1970-01-01T00:00:36.000Z,
            },
          ],
          "sunday": [
            {
              "close": 1970-01-01T21:00:00.000Z,
              "open": 1970-01-01T12:00:00.000Z,
            },
          ],
          "thursday": [
            {
              "close": 1970-01-01T18:00:00.000Z,
              "open": 1970-01-01T10:30:00.000Z,
            },
          ],
          "tuesday": [
            {
              "close": 1970-01-01T02:00:00.000Z,
              "open": 1970-01-01T01:00:00.000Z,
            },
            {
              "close": 1970-01-01T18:00:00.000Z,
              "open": 1970-01-01T10:00:00.000Z,
            },
          ],
          "wednesday": [],
        }
      `)
		})

		it('should parse opening hours correctly unordered without spans in multiple days', async () => {
			const input = {
				monday: [],
				wednesday: [],
				friday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				thursday: [
					{
						type: 'open',
						value: 37800000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				saturday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 36000000,
					},
				],
				sunday: [
					{
						type: 'open',
						value: 43200000,
					},
					{
						type: 'close',
						value: 75600000,
					},
				],
				tuesday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 7200000,
					},
					{
						type: 'close',
						value: 64800000,
					},
					{
						type: 'open',
						value: 36000000,
					},
				],
			} as unknown as OpeningHoursInput
			const parser = new HourParser(mockConfig)
			const result = await parser.parseOpeningHours(input)
			expect(result).toMatchInlineSnapshot(`
        {
          "friday": [
            {
              "close": 1970-01-01T18:00:00.000Z,
              "open": 1970-01-01T01:00:00.000Z,
            },
          ],
          "monday": [],
          "saturday": [
            {
              "close": 1970-01-01T10:00:00.000Z,
              "open": 1970-01-01T01:00:00.000Z,
            },
          ],
          "sunday": [
            {
              "close": 1970-01-01T21:00:00.000Z,
              "open": 1970-01-01T12:00:00.000Z,
            },
          ],
          "thursday": [
            {
              "close": 1970-01-01T18:00:00.000Z,
              "open": 1970-01-01T10:30:00.000Z,
            },
          ],
          "tuesday": [
            {
              "close": 1970-01-01T02:00:00.000Z,
              "open": 1970-01-01T01:00:00.000Z,
            },
            {
              "close": 1970-01-01T18:00:00.000Z,
              "open": 1970-01-01T10:00:00.000Z,
            },
          ],
          "wednesday": [],
        }
      `)
		})

		it('should parse opening hours correctly unordered without spans in multiple days with no closed hours', async () => {
			const input = {
				monday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				wednesday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				friday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				thursday: [
					{
						type: 'open',
						value: 37800000,
					},
					{
						type: 'close',
						value: 64800000,
					},
				],
				saturday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 36000000,
					},
				],
				sunday: [
					{
						type: 'open',
						value: 43200000,
					},
					{
						type: 'close',
						value: 75600000,
					},
				],
				tuesday: [
					{
						type: 'open',
						value: 3600000,
					},
					{
						type: 'close',
						value: 7200000,
					},
					{
						type: 'close',
						value: 64800000,
					},
					{
						type: 'open',
						value: 36000000,
					},
				],
			} as unknown as OpeningHoursInput
			const parser = new HourParser(mockConfig)
			const result = await parser.parseOpeningHours(input)
			expect(result).toMatchInlineSnapshot(`
      {
        "friday": [
          {
            "close": 1970-01-01T18:00:00.000Z,
            "open": 1970-01-01T01:00:00.000Z,
          },
        ],
        "monday": [
          {
            "close": 1970-01-01T18:00:00.000Z,
            "open": 1970-01-01T01:00:00.000Z,
          },
        ],
        "saturday": [
          {
            "close": 1970-01-01T10:00:00.000Z,
            "open": 1970-01-01T01:00:00.000Z,
          },
        ],
        "sunday": [
          {
            "close": 1970-01-01T21:00:00.000Z,
            "open": 1970-01-01T12:00:00.000Z,
          },
        ],
        "thursday": [
          {
            "close": 1970-01-01T18:00:00.000Z,
            "open": 1970-01-01T10:30:00.000Z,
          },
        ],
        "tuesday": [
          {
            "close": 1970-01-01T02:00:00.000Z,
            "open": 1970-01-01T01:00:00.000Z,
          },
          {
            "close": 1970-01-01T18:00:00.000Z,
            "open": 1970-01-01T10:00:00.000Z,
          },
        ],
        "wednesday": [
          {
            "close": 1970-01-01T18:00:00.000Z,
            "open": 1970-01-01T01:00:00.000Z,
          },
        ],
      }
      `)
		})
	})

	describe('toText', () => {
		it('should format intervals correctly', () => {
			const output = {
				monday: [],
				wednesday: [],
				friday: [
					{
						open: new Date('1970-01-01T09:00:00.000Z'),
						close: new Date('1970-01-01T01:00:00.000Z'),
					},
				],
				thursday: [
					{
						open: new Date('1970-01-01T09:00:00.000Z'),
						close: new Date('1970-01-01T14:00:00.000Z'),
					},
				],
				saturday: [
					{
						open: new Date('1970-01-01T09:00:00.000Z'),
						close: new Date('1970-01-01T14:00:00.000Z'),
					},
				],
				sunday: [
					{
						open: new Date('1970-01-01T09:00:00.000Z'),
						close: new Date('1970-01-01T02:00:00.000Z'),
					},
				],
				tuesday: [
					{
						open: new Date('1970-01-01T09:00:00.000Z'),
						close: new Date('1970-01-01T14:00:00.000Z'),
					},
				],
			}
			const parser = new HourParser(mockConfig)
			const result = parser.toText(output)
			expect(result).toMatchInlineSnapshot(`
      "Monday: Closed
      Wednesday: Closed
      Friday: 9:00 AM - 1:00 AM
      Thursday: 9:00 AM - 2:00 PM
      Saturday: 9:00 AM - 2:00 PM
      Sunday: 9:00 AM - 2:00 AM
      Tuesday: 9:00 AM - 2:00 PM"
      `)
		})
	})
})
