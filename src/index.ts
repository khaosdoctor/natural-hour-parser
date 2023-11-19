import { type AppConfig, appConfig } from './config.js'
import { RESTInterface } from './presentation/REST/index.js'
import { setTimeout } from 'timers/promises'
import { ParserService } from './services/parserService.js'

export type ServiceList = Awaited<ReturnType<typeof initializeDependencies>>
export type ApplicationInterface = (
	config: AppConfig,
	services: ServiceList
) => Promise<{ start: () => Promise<void>; stop: () => Promise<void> }>

/**
 * It's also possible to use a dependency injection framework like InversifyJS
 * or TSyringe here to manage dependencies and create DI containers
 * but this would be overkill for this example
 */
async function initializeDependencies(config: AppConfig) {
	return {
		parserService: new ParserService(config),
	}
}

async function main(application: ApplicationInterface, config: AppConfig) {
	const logger = config.logger.extend('main')
	logger('Starting application with config %O', config)

	const services = await initializeDependencies(config)
	const { start, stop } = await application(config, services)

	const gracefulTimeout = async () => {
		await Promise.race([
			stop(),
			setTimeout(5000).then(() => {
				console.info('Graceful shutdown timed out, forcing exit')
				process.exit(1)
			}),
		])
	}

	// Graceful shutdown
	process.on('SIGINT', async () => {
		logger('SIGINT signal received.')
		await gracefulTimeout()
	})
	process.on('SIGTERM', async () => {
		logger('SIGTERM signal received.')
		await gracefulTimeout()
	})
	process.on('unhandledRejection', (reason) => {
		logger('Unhandled rejection', reason)
	})
	process.on('uncaughtException', async (error) => {
		logger('Uncaught exception', error)
		await gracefulTimeout()
	})

	await start()
}

const config = appConfig()
await main(RESTInterface, config)
