interface HTTPErrorOptions extends ErrorOptions {
	status: number
	message: string
	code?: string
	name: string
}

/**
 * Base class for all domain errors
 * Since we only have a simple domain I decided to add it all in options here
 * the ideal path would be to have different classes for different errors
 * that would extend this one, so a BadRequestError would extend DomainError and so on
 * but this would cause a lot of boilerplate code for a simple domain
 */
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
