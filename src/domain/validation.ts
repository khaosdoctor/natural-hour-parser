import { z } from 'zod'
import { MAX_SECONDS_IN_DAY } from './constants.js'
import { OperationState, WeekDays } from './types.js'

export const OpeningStateIntervalSchema = z.object({
	type: z.nativeEnum(OperationState),
	value: z
		.number()
		.max(MAX_SECONDS_IN_DAY)
		// We need to multiply the value by 1000 because the input is in seconds
		.transform((value) => value * 1000),
})
export type OpeningStateInterval = z.infer<typeof OpeningStateIntervalSchema>

export const OpeningHoursInputSchema = z.object({
	[WeekDays.sunday]: z.array(OpeningStateIntervalSchema).optional().default([]),
	[WeekDays.monday]: z.array(OpeningStateIntervalSchema).optional().default([]),
	[WeekDays.tuesday]: z
		.array(OpeningStateIntervalSchema)
		.optional()
		.default([]),
	[WeekDays.wednesday]: z
		.array(OpeningStateIntervalSchema)
		.optional()
		.default([]),
	[WeekDays.thursday]: z
		.array(OpeningStateIntervalSchema)
		.optional()
		.default([]),
	[WeekDays.friday]: z.array(OpeningStateIntervalSchema).optional().default([]),
	[WeekDays.saturday]: z
		.array(OpeningStateIntervalSchema)
		.optional()
		.default([]),
})

export type OpeningHoursInput = z.infer<typeof OpeningHoursInputSchema>
