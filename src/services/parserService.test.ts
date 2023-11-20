import debug from 'debug'
import { type AppConfig } from '../config.js'
import { HourParser } from '../domain/Parser.js'
import { type OpeningHoursInput } from '../domain/validation.js'
import { ParserService } from './parserService.js'

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
			value: 36000000,
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
			type: 'close',
			value: 64800000,
		},
		{
			type: 'open',
			value: 36000000,
		},
	],
} as unknown as OpeningHoursInput

describe('ParserService', () => {
	afterEach(() => {
		jest.resetAllMocks()
	})

	describe('parseOpeningHours', () => {
		const parserSpy = jest.spyOn(HourParser.prototype, 'parseOpeningHours')
		it('should parse opening hours as empty when no input', async () => {
			const testConfig = {
				logger: {
					extend: jest.fn(() => debug('test')),
				},
			} as unknown as AppConfig
			const service = new ParserService(testConfig)
			const result = await service.parseOpeningHours({})

			expect(parserSpy).toHaveBeenCalledTimes(1)
			expect(result).toEqual({})
			expect(testConfig.logger.extend).toHaveBeenCalled()
		})

		it('should parse opening hours', async () => {
			const testConfig = {
				logger: {
					extend: jest.fn(() => debug('test')),
				},
			} as unknown as AppConfig

			const service = new ParserService(testConfig)
			const result = await service.parseOpeningHours(input)
			expect(parserSpy).toHaveBeenCalledTimes(1)
			expect(parserSpy).toHaveBeenCalledWith(input)
			expect(parserSpy).toHaveReturnedWith(result)
			expect(parserSpy.mock.lastCall).toMatchInlineSnapshot(`
[
  {
    "friday": [
      {
        "type": "open",
        "value": 36000000,
      },
    ],
    "monday": [],
    "saturday": [
      {
        "type": "close",
        "value": 3600000,
      },
      {
        "type": "open",
        "value": 36000000,
      },
    ],
    "sunday": [
      {
        "type": "close",
        "value": 3600000,
      },
      {
        "type": "open",
        "value": 43200000,
      },
      {
        "type": "close",
        "value": 75600000,
      },
    ],
    "thursday": [
      {
        "type": "open",
        "value": 37800000,
      },
      {
        "type": "close",
        "value": 64800000,
      },
    ],
    "tuesday": [
      {
        "type": "close",
        "value": 64800000,
      },
      {
        "type": "open",
        "value": 36000000,
      },
    ],
    "wednesday": [],
  },
]
`)
		})

		it('should bubble up errors in the parser', async () => {
			const testConfig = {
				logger: {
					extend: jest.fn(() => debug('test')),
				},
			} as unknown as AppConfig
			parserSpy.mockImplementationOnce(() => {
				throw new Error('test')
			})
			const service = new ParserService(testConfig)
			await expect(service.parseOpeningHours({})).rejects.toThrow('test')
		})
	})

	describe('formatIntervals', () => {
		it('should format intervals', async () => {
			const testConfig = {
				logger: {
					extend: jest.fn(() => debug('test')),
				},
			} as unknown as AppConfig
			const service = new ParserService(testConfig)
			const result = service.formatIntervals(output)
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
