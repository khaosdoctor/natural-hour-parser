import { type Debugger } from 'debug'
import { type NextFunction, type Request, type Response } from 'express'
import { HTTPError } from '../errors/HTTPError.js'

export function errorBoundary(baseLogger: Debugger) {
	const logger = baseLogger.extend('errorBoundary')
	return async (
		err: unknown,
		_: Request,
		res: Response,
		next: NextFunction
	) => {
		if (err) {
			if (err instanceof HTTPError) {
				logger('HTTPError: %O', err.toObject())
				logger('Stack: %O', err.stack)
				return res.status(err.status).json(err.toObject())
			}
		}
		res.status(500).json({
			message: 'Internal server error',
		})
	}
}
