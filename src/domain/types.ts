// We can't use const enums here because
// We are using both the enum values and the enum type
export enum OperationState {
	open = 'open',
	close = 'close',
}

export enum WeekDays {
	sunday = 'sunday',
	monday = 'monday',
	tuesday = 'tuesday',
	wednesday = 'wednesday',
	thursday = 'thursday',
	friday = 'friday',
	saturday = 'saturday',
}

export type WeekdayList = keyof typeof WeekDays
