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
				const result = await services.parserService.parseOpeningHours(req.body)
				routeLogger('Parsed opening hours: %O', result)

				res.set({
					'Content-Type': 'text/plain',
				})

				return res.send(services.parserService.formatIntervals(result)).end()
			} catch (error) {
				routeLogger('Error parsing opening hours: %O', error)
				next(error)
			}
		}
	)

	return router
}
