import Express from 'express'
import helmet from 'helmet'
import { type Server } from 'http'
import { type AppConfig } from '../../config.js'
import { OpeningHoursInputSchema } from '../../domain/validation.js'
import { type ServiceList } from '../../index.js'
import { errorBoundary } from './middlewares/errorBoundary.js'
import { validateZodSchema } from './middlewares/zodValidation.js'
import { parserRouterFactory } from './routers/parserRouter.js'

export async function RESTInterface(config: AppConfig, services: ServiceList) {
	const logger = config.logger.extend('RESTInterface')
	const app = Express()
	app.use(helmet())
	app.use(Express.json())
	app.get('/ping', (_, res) => res.send('pong'))

	app.use(
		'/parsers',
		validateZodSchema(OpeningHoursInputSchema),
		parserRouterFactory(config, services)
	)

	app.use(errorBoundary(logger))

	let server: Server | undefined
	return {
		async start() {
			logger('Starting REST Interface')
			server = app.listen(config.PORT, () => {
				console.log(`Listening on port ${config.PORT}`)
			})
		},
		async stop() {
			logger('Stopping REST Interface')
			if (server) {
				server.close((err) => {
					let exitCode = 0
					if (err) {
						logger('Error stopping REST Interface: %O', err)
						exitCode = 1
					}
					logger('REST Interface stopped')
					process.exit(exitCode)
				})
				return
			}
			process.exit(0)
		},
	}
}
