import debug from 'debug'
import request from 'supertest'
import { type AppConfig } from '../../config.js'
import { ParserService } from '../../services/parserService.js'
import { RESTInterface } from './index.js'

// Mock config
const mockConfig: AppConfig = {
	logger: debug('test:integration'),
	PORT: 3000,
}

const services = {
	parserService: new ParserService(mockConfig),
}

const input = {
	monday: [],
	tuesday: [
		{
			type: 'open',
			value: 36000,
		},
		{
			type: 'close',
			value: 64800,
		},
	],
	wednesday: [],
	thursday: [
		{
			type: 'open',
			value: 37800,
		},
		{
			type: 'close',
			value: 64800,
		},
	],
	friday: [
		{
			type: 'open',
			value: 36000,
		},
	],
	saturday: [
		{
			type: 'close',
			value: 3600,
		},
		{
			type: 'open',
			value: 36000,
		},
	],
	sunday: [
		{
			type: 'close',
			value: 3600,
		},
		{
			type: 'open',
			value: 43200,
		},
		{
			type: 'close',
			value: 75600,
		},
	],
}

const { app } = RESTInterface(mockConfig, services)
const wrappedApp = request(app)
describe('Integration Tests', () => {
	describe('GET /ping', () => {
		it('should return "pong"', async () => {
			const response = await wrappedApp.get('/ping')
			expect(response.statusCode).toBe(200)
			expect(response.text).toBe('pong')
		})
	})

	describe('POST /parsers/restaurants/opening-hours', () => {
		it('should return parsed opening hours in JSON format', async () => {
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send(input)
				.set('Accept', 'application/json')

			expect(response.status).toBe(200)
			expect(response.body).toMatchSnapshot()
			expect(response.header['content-type']).toContain('application/json')
		})

		it('should return parsed opening hours in text format', async () => {
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send(input)
				.set('Accept', 'text/plain')

			expect(response.status).toBe(200)
			expect(response.text).toMatchSnapshot()
			expect(response.header['content-type']).toContain('text/plain')
		})

		it('should return 406 on invalid formats', async () => {
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send(input)
				.set('Accept', 'text/csv')

			expect(response.status).toBe(406)
		})

		it('should strip unknown keys and treat as valid input', async () => {
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send({ invalid: 'input' })

			expect(response.status).toBe(200)
			expect(response.body).toMatchInlineSnapshot(`{}`)
		})

		it('should handle input errors', async () => {
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send({
					monday: [
						{
							type: 'not a valid type',
							value: 36000,
						},
					],
				})

			expect(response.status).toBe(422)
			expect(response.body).toMatchSnapshot()
		})

		it('should handle any other errors as boundaries', async () => {
			const mockParserService = {
				parseOpeningHours: jest.fn(() => {
					throw new Error('Something went wrong')
				}),
			}
			const { app } = RESTInterface(mockConfig, {
				parserService: mockParserService as any,
			})
			const wrappedApp = request(app)
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send({})

			expect(response.status).toBe(500)
			expect(response.body).toMatchSnapshot()
		})

		it('should handle domain errors', async () => {
			const wrappedApp = request(app)
			const response = await wrappedApp
				.post('/parsers/restaurants/opening-hours')
				.send({
					monday: [
						{
							type: 'open',
							value: 3600,
						},
					],
				})

			expect(response.status).toBe(422)
			expect(response.body).toMatchSnapshot()
		})
	})
})
