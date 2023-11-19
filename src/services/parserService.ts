import { type Debugger } from 'debug'
import { type AppConfig } from '../config.js'
import { HourParser } from '../domain/Parser.js'
import { type OpeningHoursInput } from '../domain/validation.js'

export class ParserService {
	readonly #logger: Debugger
	readonly #parser: HourParser
	constructor(config: AppConfig) {
		this.#logger = config.logger.extend('ParserService')
		this.#logger('ParserService initialized')
		this.#parser = new HourParser(config)
	}

	async parseOpeningHours(input: OpeningHoursInput) {
		this.#logger('Parsing opening hours')
		return await this.#parser.parseOpeningHours(input)
	}
}
