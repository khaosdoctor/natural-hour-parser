import { type Debugger } from 'debug'
import { type AppConfig } from '../config.js'
import {
	OperationState,
	type WeekDays,
	type WeekdayList,
} from '../domain/types.js'
import {
	type OpeningHoursInput,
	type OpeningStateInterval,
} from '../domain/validation.js'
import { DomainError } from './errors/DomainError.js'
import { capitalize, indexToWeekday, weekdayToIndex } from './utils.js'

interface Interval {
	open?: Date
	close?: Date
}

type IntervalObject = {
	[k in WeekDays]: Array<Required<Interval>>
}

type StateKeeper = { [k in WeekDays]: Interval }

export class HourParser {
	readonly #logger: Debugger
	constructor(config: AppConfig) {
		this.#logger = config.logger.extend(HourParser.name)
		this.#logger(`${HourParser.name} initialized`)
	}

	async parseOpeningHours(input: OpeningHoursInput) {
		this.#logger('Parsing opening hours')
		this.#validateInput(input)

		let state: StateKeeper = {} as unknown as StateKeeper
		let finalInterval: IntervalObject = {} as unknown as IntervalObject
		const entries = Object.entries(input) as Array<
			[WeekdayList, OpeningStateInterval[]]
		>

		for (const [day, openStateArray] of entries) {
			this.#logger('Parsing %s', day)

			if (openStateArray.length === 0) {
				this.#logger('No opening hours for %s', day)
				finalInterval[day] = []
				continue
			}

			// sorts all the array by the hours so we can match the opening and closing hours
			const sortedState = openStateArray.toSorted((a, b) => a.value - b.value)
			finalInterval[day] = finalInterval[day] ?? []
			state[day] = state[day] ?? {}

			const updatedState = this.#parseIntervalsForDay(
				sortedState,
				day,
				state,
				finalInterval
			)
			finalInterval = structuredClone(updatedState.finalInterval)
			state = structuredClone(updatedState.state)
		}

		this.#logger('Final interval: %O', finalInterval)
		return finalInterval
	}

	#parseIntervalsForDay(
		sortedState: OpeningStateInterval[],
		day: WeekdayList,
		stateKeeper: StateKeeper,
		finalAccumulator: IntervalObject
	) {
		const logger = this.#logger.extend(`parseIntervalsForDay:${day}`)
		const finalInterval = structuredClone(finalAccumulator)
		const state = structuredClone(stateKeeper)

		sortedState.forEach(({ type, value }, index) => {
			// Closing on previous day
			if (index === 0 && type === OperationState.close) {
				logger('Found closing on previous day')
				const todayIndex = this.#getCurrentDayIndex(day)
				const yesterday = indexToWeekday[(todayIndex + 6) % 7]

				if (!this.#checkForMatchingState(yesterday, state[yesterday])) {
					logger('No matching state for %s', yesterday)
					state[yesterday] = state[yesterday] ?? {}
					state[yesterday].close = new Date(new Date(value).toUTCString())
					const stateToPush = structuredClone(state[yesterday])

					if (this.#checkForMatchingState(yesterday, stateToPush)) {
						finalInterval[yesterday].push(stateToPush)
						logger('Added %s to final interval', yesterday)
						logger(
							`set close time for ${yesterday}: %O`,
							finalInterval[yesterday]
						)
						state[yesterday] = {}
					}
					return
				}
			}

			logger('Setting state for %s on %s', type, day)
			logger('Current state: %O', state)
			state[day][type] = new Date(new Date(value).toUTCString())
			logger('State set for %s', day)
			logger('Current state: %O', state)

			logger('Found final state for %s', day)
			const stateToPush = structuredClone(state[day])
			if (this.#checkForMatchingState(day, stateToPush)) {
				finalInterval[day].push(stateToPush)
				state[day] = {}
			}
		})

		return {
			finalInterval,
			state,
		}
	}

	#getCurrentDayIndex(day: WeekdayList) {
		const todayIndex = weekdayToIndex.get(day)
		// This should never happen
		// it's just a sanity check so TS doesn't complain
		// because map.get can return undefined by definition
		/* istanbul ignore next */
		if (todayIndex === undefined || todayIndex === null) {
			throw new Error(`Invalid Day index`)
		}
		return todayIndex
	}

	#checkForMatchingState(
		day: string,
		state: Interval
	): state is Required<Interval> {
		this.#logger(`Checking state for ${day}: %O`)
		return state && 'open' in state && 'close' in state
	}

	#validateInput(input: OpeningHoursInput) {
		// The number of opening and closing hours must match
		// otherwise we will end up with an open or closed state without a match
		const totalCount = Object.values(input).flat().length
		if (totalCount % 2 !== 0) {
			throw new DomainError({
				message: 'Number of opening and closing hours must match',
				name: 'InvalidInputError',
				status: 422,
				code: 'INVALID_INPUT',
			})
		}
	}

	toText(input: IntervalObject) {
		const logger = this.#logger.extend('formatOutput')
		const entries = Object.entries(input)
		const formatter = Intl.DateTimeFormat('en-US', {
			hour12: true,
			timeStyle: 'short',
			timeZone: 'UTC',
		})

		const formatted = entries.map(([day, intervals]) => {
			logger('Formatting %s', day)
			const formattedIntervals = intervals.length
				? intervals.map(({ open, close }) => {
						logger('Formatting %s - %s', open, close)
						return `${formatter.format(open)} - ${formatter.format(close)}`
				  })
				: ['Closed']
			logger('Formatted intervals: %O', formattedIntervals)
			return `${capitalize(day)}: ${formattedIntervals.join(', ')}`
		})

		logger('Formatted output: %O', formatted)
		return formatted.join('\n')
	}
}
