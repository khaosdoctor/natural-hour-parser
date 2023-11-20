import { z, type ZodArray } from 'zod'
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

// Gets the keys of the enum and creates an array of them ['sunday', 'monday', ...]
const objectSchema: {
	[k in WeekDays]?: ZodArray<typeof OpeningStateIntervalSchema>
} = Object.keys(WeekDays).reduce((acc, key) => {
	// Then reduce the array to an object with the keys being the enum values
	// and the values being the zod schema for the opening hours
	// { sunday: z.array(z.object({ type: z.nativeEnum(OperationState), value: z.number().max(86399) })), ... }
	return {
		...acc,
		[key]: z.array(OpeningStateIntervalSchema),
	}
}, {})

export const OpeningHoursInputSchema = z.object(objectSchema).partial()

// Zod Inference did not work here
// most likely because of the dynamic object
export type OpeningHoursInput = {
	[k in WeekDays]?: OpeningStateInterval[]
}
