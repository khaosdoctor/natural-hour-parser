import { Router, type Request } from 'express'
import { type AppConfig } from '../../../config.js'
import { type ServiceList } from '../../../index.js'
import { type OpeningHoursInput } from '../../../domain/validation.js'

export function getParserRoutes(config: AppConfig, services: ServiceList) {
	const logger = config.logger.extend('parserRouter')
	const router = Router()

	router.post(
		'/restaurants/opening-hours',
		async (req: Request<never, any, OpeningHoursInput>, res, next) => {
			const routeLogger = logger.extend(`${req.method} ${req.path}`)

			try {
				routeLogger('Parsing opening hours')
				if (!req.accepts(['application/json', 'text/plain'])) {
					return res.status(406).end()
				}

				const result = await services.parserService.parseOpeningHours(req.body)
				routeLogger('Parsed opening hours: %O', result)

				switch (req.accepts(['text/plain', 'application/json'])) {
					case 'application/json':
						res.set({
							'Content-Type': 'application/json',
						})
						return res.send(result).end()
					case 'text/plain':
					default:
						res.set({
							'Content-Type': 'text/plain',
						})
						return res
							.send(services.parserService.formatIntervals(result))
							.end()
				}
			} catch (error) {
				routeLogger('Error parsing opening hours: %O', error)
				next(error)
			}
		}
	)

	return router
}
