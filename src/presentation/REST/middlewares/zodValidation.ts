import { type NextFunction, type Request, type Response } from 'express'
import { ZodError, type ZodSchema } from 'zod'
import debug from 'debug'
const logger = debug('wolt:zodValidation')

export function validateZodSchema(
	schema: ZodSchema,
	property: 'body' | 'query' | 'params' = 'body'
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			logger('Validating %s', property)
			if (!req[property]) throw new Error(`Missing ${property} in request`)
			const result = await schema.parseAsync(req[property])
			logger('Validation successful: %O', result)
			req[property] = result
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				logger('Validation failed: %O', error)
				return res.status(422).json(error)
			}
			next(error)
		}
	}
}
