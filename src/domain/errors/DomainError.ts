interface HTTPErrorOptions extends ErrorOptions {
	status: number
	message: string
	code?: string
	name: string
}

export class DomainError extends Error {
	status: number = 500
	code: string = 'UNKNOWN_ERROR'
	constructor(options: HTTPErrorOptions) {
		super(options.message)
		this.name = options.name
		this.code = options.code ?? this.code
		this.status = options.status ?? this.status
	}

	toObject() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
		}
	}
}
