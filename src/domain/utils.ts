import { WeekDays, type WeekdayList } from './types.js'

export const indexToWeekday = Object.values(WeekDays)
export const weekdayToIndex = new Map(
	Object.entries(indexToWeekday).map(([index, day]) => [
		day as WeekdayList,
		Number(index),
	])
)
