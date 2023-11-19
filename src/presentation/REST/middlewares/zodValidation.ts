import { type NextFunction, type Request, type Response } from 'express'
import { ZodError, type ZodSchema } from 'zod'

export function validateZodSchema(
	schema: ZodSchema,
	property: 'body' | 'query' | 'params' = 'body'
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req[property]) throw new Error(`Missing ${property} in request`)
			const result = await schema.parseAsync(req[property])
			req[property] = result
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(422).json(error)
			}
			next(error)
		}
	}
}
