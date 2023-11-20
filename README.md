# Openning times

> Technical assignment for Wolt

## Table of Contents

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Openning times](#openning-times)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
    - [Cases](#cases)
  - [Installation](#installation)
    - [Scripts](#scripts)
    - [Docker](#docker)
      - [Compose](#compose)
  - [Usage](#usage)
    - [Changing the output format](#changing-the-output-format)
  - [Technical remarks](#technical-remarks)
    - [Architecture](#architecture)
    - [Validation](#validation)
    - [General remarks](#general-remarks)
    - [Potential edge cases](#potential-edge-cases)
- [About the input format](#about-the-input-format)
  - [Keeping as JSON Objects](#keeping-as-json-objects)
  - [JSON Arrays](#json-arrays)
  - [Bitmaps](#bitmaps)

<!-- /code_chunk_output -->

## Description

This is a simple application that takes a JSON as an input and outputs the opening hours of a restaurant in a human readable format. Input JSON consists of keys indicating days of a week and corresponding opening hours as values. One JSON file includes data for one restaurant.

```
{
<dayofweek>: <opening hours>
<dayofweek>: <opening hours>
...
}
```

<dayofweek>: monday / tuesday / wednesday / thursday / friday / saturday / sunday
<opening hours>: an array of objects containing opening hours. Each object consist of two keys:

- **type**: open or close
- **value**: opening / closing time as UNIX time (1.1.1970 as a date),
  e.g. 32400 = 9 AM, 37800 = 10:30 AM,
  max value is 86399 = 11:59:59 PM

The output should be in human readable format using **12-hour clocks**:

```
Monday: 8 AM - 10 AM, 11 AM - 6 PM
Tuesday: Closed
Wednesday: 11 AM - 6 PM
Thursday: 11 AM - 6 PM
Friday: 11 AM - 9 PM
Saturday: 11 AM - 9 PM
Sunday: Closed
```

**Example Input**

```json
{
	"monday": [],
	"wednesday": [],
	"friday": [
		{
			"type": "open",
			"value": 36000
		}
	],
	"thursday": [
		{
			"type": "open",
			"value": 37800
		},
		{
			"type": "close",
			"value": 64800
		}
	],
	"saturday": [
		{
			"type": "close",
			"value": 3600
		},
		{
			"type": "open",
			"value": 36000
		}
	],
	"sunday": [
		{
			"type": "close",
			"value": 3600
		},
		{
			"type": "open",
			"value": 43200
		},
		{
			"type": "close",
			"value": 75600
		}
	],
	"tuesday": [
		{
			"type": "close",
			"value": 64800
		},
		{
			"type": "open",
			"value": 36000
		}
	]
}
```

### Cases

- If a restaurant is closed the whole day, the value of that day is an empty array.
- A restaurante can be opened and closed multiple times during the same day.
  - E.g. a restaurant can be open from 10 AM to 1 PM and from 5 PM to 10 PM on Mondays.
- The restaurant can be opened in one day and closed in another day.
  - E.g. a restaurant can be open from Thursday 5 PM to Friday 1 AM. In this case, the _Thursday_ object will include the opening time, and the _Friday_ object will include the closing time.
  - When printing these time spans that goes for multiple days, the closing time is always a part of the day when the restaurant is open.
    - E.g. if a restaurant is open from Thursday 5 PM to Friday 1 AM, the output should be:
      - `Thursday: 5 PM - 1 AM`

## Installation

1. Clone the repository
2. Install the dependencies with `npm install`
3. Run the application with `npm run start:dev`
4. Send a `POST` request to `http://localhost:3000/parsers/restaurants/opening-hours` with the JSON in the body

> The application runs on port `3000` by default in development mode, you can change it in "production" by setting the `PORT` environment variable in an `.env` file or `PORT` environment variable and running `npm start`.

### Scripts

- `npm run start:dev`: Runs the application in development mode, which will print the debug logs in the console. All debug logs are prefixed with `wolt:` if you wish to filter them just set a `DEBUG` environment variable with a string `wolt:something:*`, refer to the [debug](https://www.npmjs.com/package/debug) package documentation for more information.
- `npm start`: Runs the application in production mode, which will not print the debug logs in the console.
- `npm test`: Runs the tests and prints the coverage report in the console.

### Docker

There's a Dockerfile that can be used to generate an image of the application, you can use the following commands to generate the image and run it:

```sh
# Generate the image
docker build -t wolt/opening-times .
```

Then run with:

```sh
# Run the image
docker run -dp 3000:3000 wolt/opening-times
```

The docker image can be used to deploy the service to any other environment, as well as passing the environment variables to the container with:

```sh
# Run the image with environment variables
docker run -dp 3000:3000 -e 'PORT=8080' -e 'DEBUG=wolt*' wolt/opening-times
```

The image is the `node:iron-alpine` which is a very lightweigth and also reduces the attack surface of the application. The only files sent to it are the built files and the `package.json` file. All non-necessary scripts are removed from the image and all the non-production are not installed.

#### Compose

You can also spin up a docker-compose with the following command:

```sh
# Run the docker-compose
docker-compose up -d
```

This will automatically build the image and run it with the default variables and execute it as if it was running as a developer with `npm run start:dev`.

## Usage

The application only has one endpoint `POST /parsers/restaurants/opening-hours` which expects a JSON in the body with the following structure:

```json
{
	"monday": [],
	"tuesday": [],
	"wednesday": [],
	"thursday": [],
	"friday": [],
	"saturday": [],
	"sunday": []
}
```

No input is also a valid input, however as choice made, **days that are not sent will be considered as closed**, so an input like `{}` will be parsed as:

```json
{
	"monday": [],
	"tuesday": [],
	"wednesday": [],
	"thursday": [],
	"friday": [],
	"saturday": [],
	"sunday": []
}
```

Unknown keys will be stripped and ignored. So:

```json
{
	"unknown": [],
	"other": "key",
	"monday": []
}
```

Will be parsed as:

```json
{
	"monday": []
}
```

### Changing the output format

You can use the `Accept` header to change the output format, the application supports `application/json` and `text/plain` formats. If you don't specify the `Accept` header, the application will default to `application/json`. If there's any other value than `application/json` or `text/plain` the application will return a `406 Not Acceptable` error.

Example response with JSON:

```json
{
	"sunday": [
		{
			"open": "1970-01-01T12:00:00.000Z",
			"close": "1970-01-01T21:00:00.000Z"
		}
	],
	"monday": [],
	"tuesday": [
		{
			"open": "1970-01-01T01:00:00.000Z",
			"close": "1970-01-01T02:00:00.000Z"
		},
		{
			"open": "1970-01-01T10:00:00.000Z",
			"close": "1970-01-01T18:00:00.000Z"
		}
	],
	"wednesday": [],
	"thursday": [
		{
			"open": "1970-01-01T10:30:00.000Z",
			"close": "1970-01-01T18:00:00.000Z"
		}
	],
	"friday": [
		{
			"open": "1970-01-01T10:00:00.000Z",
			"close": "1970-01-01T01:00:00.000Z"
		}
	],
	"saturday": [
		{
			"close": "1970-01-01T01:00:00.000Z",
			"open": "1970-01-01T10:00:00.000Z"
		}
	]
}
```

Example response with text:

```
Sunday: 12:00 PM - 9:00 PM
Monday: Closed
Tuesday: 1:00 AM - 2:00 AM, 10:00 AM - 6:00 PM
Wednesday: Closed
Thursday: 10:30 AM - 6:00 PM
Friday: 10:00 AM - 1:00 AM
Saturday: 10:00 AM - 1:00 AM
```

## Technical remarks

### Architecture

I'm using a mix of an layered architecture with a simpler concept. The application is divided into two main layers: the presentation layer and the service layer.

- The **presentation layer** is responsible for handling the HTTP requests and responses, as well as the validation of the input and the output. Each presentation interface can be found in the `src/presentation` folder.
  - I chose to do it like this so we could easily add more interfaces in the future, for example, we could add a CLI interface or a GraphQL interface.
  - All HTTP validation (and object validation) is done using [zod](https://zod.dev)
  - The REST interface is using [express](https://expressjs.com) as the HTTP server, I don't think it's the best out there, but it's the most popular and it's very simple to use.
  - There's an integration test for this interface in the [index.test.ts](./src/presentation/REST/index.test.ts) file.
- The **service layer** in most cases is the layer that connects the presentation with the data layer, since we don't have a data layer in this application, it's just a layer that connects the presentation with the business logic.
  - I chose to do it like this so we could easily add a data layer in the future, for example, we could add a database to store the restaurants and their opening hours.
  - The service layer is also responsible for calling the Parser, which is the business logic of the application.

There's a third part of the application which I call the **domain layer**, which is the `src/domain` folder. This layer is responsible for the business logic of the application, in this case, it's the Parser. I chose to separate it from the service layer because it's the core of the application and it's the part that is most likely to change in the future.

Also, parser code is agnostic to the input and output format, so we could easily add more parsers in the future, for example, we could add a parser method that reads the input from a database (through the service layer) and outputs the opening hours in a CSV format, since all the sorting and parsing logic is done in one method, we could easily add other methods that will convert this final object to other outputs if needed.

The _domain_ layer is also responsible for holding the types, validations, errors, constants, and any other utility functions that are used in the application since it can be used by both the presentation and the service layers.

- **Types**: All the types are defined in the `src/domain/types.ts` file, this file is used by both the presentation and the service layers.
- **Errors**: All the errors are defined in the `src/domain/errors` directory, it was possible to create more errors but since we only have one parser, I decided to keep it simple and only create one error with multiple options. You can find more comments on it on [the error file](./src/domain/errors/DomainError.ts).
- **Constants**: All the constants are defined in the `src/domain/constants.ts` file, I usually keep the constants and the types in the same file, but in this case I decided to separate to make it easier to read.
- **Utilities**: All the utility functions are defined in the `src/domain/utils.ts` file, these are general utilities like casing, index to day of the week, etc.

### Validation

I usually use [zod](https://zod.dev) for validation, it's a very simple and lightweight package that allows us to easily validate objects and types. I'm using it to validate the input and output of the application, as well as the configuration in general.

Usually, when I'm using a layered architecture, I create an entity class that will have the validation logic, but in this application there are no entities, so the validation schemas are in the [`src/domain/validation.ts`](./src/domain/validation.ts) file.

For the presentation layer, I usually validate the schemas with a middleware, this app has a [zod middleware](./src/presentation/REST/middlewares/zodValidation.ts) that validates the input schema and returns 422 if it's invalid.

For all other errors, there's [another middleware](./src/presentation/REST/middlewares/errorBoundary.ts) for the error boundary that will catch all errors and return a 500 error if they cannot be resolved to a known error.

### General remarks

- I'm using Node 20.6+ with ES6 modules so we have the latest features of the language.
- I could use Node's native test runner but it's still experimental and it doesn't have a good support for general mocks, so I'm using [Jest](https://jestjs.io) instead.
  - I personally don't like jest a lot, but the way it mocks the modules is very simple and it's very easy to use. I could also use [sinon](https://sinonjs.org) but Jest already comes with the runner bundled.
  - Jest has a problem with the newest configurations for ESM that requires a lot of boilerplate code and some trial and error to use. I set it up with TS-Jest but unfortunately some features like top-level await are not supported yet, and some other features are in a limbo stage where you have to use a lot of workarounds to make it work.
  - In my opinion, the Node.js test runner in the future will be the best option, but it has a very weird API for assertions as well as mocking, so, despite being a contributor to that, I'm not actively using it yet.
- I'm using [debug](https://www.npmjs.com/package/debug) for logging, it's a very simple and lightweight package that allows us to easily filter the logs by prefix.
- There are some comments in the code, I usually don't like to add comments unless it's to make it easier to understand, but I added some to explain some decisions I made.

### Potential edge cases

- To avoid sorting problems, I'm sorting the days of the week by their index, so the output is always sorted by the day of the week, as well as the opening hours are always being sorted from the earliest to the latest. This way the JSON input can have the days of the week in any order and the output will always be the same.
- The validation is assuming that no input is also a valid input, in this case, the output will assume all days are closed days
- The validation is assuming that non-existing days of the week or unknown keys will be stripped and ignored.

# About the input format

While receiving the data in the current input format is easier to read, it's difficult to parse, especially when we have to deal with dates that spans through multiple days. Because of this, we need to keep a state of the current opened and closed times for each day of the week. This state is a tuple, every time the object has both the `open` and `close` properties, we need to add it to the final output and reset the state.

Since the input is sorted, this allowed me to use the state as a track of when I opened a restaurant but didn't close it, since the closing time in the next day would always be the first, and the open time in the day before would always be the last.

## Keeping as JSON Objects

To remove the need of a state completely we could rely on intervals rather than individual objects. The input would remain essentially the same if we wanted to keep it easier to read, but the values would differ, instead of having the open and close times as being the actual hours based on the UNIX time, only the opening time would be the actual hour, the closing time would be the duration of the opening time. This way we could easily parse the input without the need of a state, and we could also easily calculate the closing time of the restaurant.

For example, for a restaurant that opens from 10PM to 1AM next day:

```json
{
	"monday": [
		{
			"type": "open",
			"value": 79200
		},
		{
			"type": "duration",
			"value": 10800
		}
	]
}
```

Then we could parse it like this:

```ts
const currentIteration = [
	'monday',
	[
		{
			type: 'open',
			value: 79200,
		},
		{
			type: 'duration',
			value: 10800,
		},
	],
]

for (const [day, duration] of currentIteration) {
	const [openingTime, closingTime] = duration
	const openingTime = new Date(new Date(openingTime.value * 1000).toUTCString())
	// openingTime = 1970-01-01T22:00:00.000Z
	const closingTime = new Date(
		new Date((openingTime.value + closingTime.value) * 1000).toUTCString()
	)
	// closingTime = 1970-01-02T01:00:00.000Z
}
```

Since we're just using the time, we would be able to represent the closing time as `01:00:00` and the opening time as `22:00:00`, and we could easily calculate the closing time by adding the duration to the opening time.

We could also simplify the input by using it as a single object:

```json
{
	"monday": {
		"open": 79200,
		"duration": 10800
	}
}
```

Then we could parse it like this:

```ts
const currentIteration = [
	'monday',
	{
		open: 79200,
		duration: 10800,
	},
]

for (const [day, interval] of currentIteration) {
	const openingTime = new Date(new Date(interval.open * 1000).toUTCString())
	// openingTime = 1970-01-01T22:00:00.000Z
	const closingTime = new Date(
		new Date((interval.value + interval.duration) * 1000).toUTCString()
	)
	// closingTime = 1970-01-02T01:00:00.000Z
}
```

Now we don't need to keep a state, because all the days have the opening and closing time in the same object.

## JSON Arrays

To further simplify we could remove the need of sending the day altogether and rely on the indexes of arrays to represent the day of the week. This way we could remove the need of the state and also the need of the day of the week in the object since we could always parse it as being related to the index in the array, so 0 would be Sunday, 1 Monday, and so on.

Then the first element of the array is the opening time, and the second element is the duration of the interval.

```json
[
	[79200, 10800] // Sunday 10PM - 1AM
]
```

Then we could parse it like this:

```ts
const currentIteration = [[79200, 10800]] // Sunday 10PM - 1AM

for (const [index, interval] in currentIteration) {
	const openingTime = new Date(new Date(interval[0] * 1000).toUTCString())
	// openingTime = 1970-01-01T22:00:00.000Z
	const closingTime = new Date(
		new Date((interval[0] + interval[1]) * 1000).toUTCString()
	)
	// closingTime = 1970-01-02T01:00:00.000Z
}
```

The bad side of this is that we are not conveying a lot of meaning in the input, so it's harder to read and understand. But it's easier to parse and it's also easier to calculate the closing time of the restaurant.

> It's also possible to use objects instead of tuples, so instead of `[79200, 10800]` we could have `{ open: 79200, duration: 10800 }`, the parsing would be essentially the same

## Bitmaps

> This is a wild idea, but I think it's interesting to think about it.

We could also use bitmaps to represent the opening hours, this way we could represent the opening hours in a single number. This would be a very efficient way to represent the opening hours, but it would be very hard to read and understand, the code to parse it wouldn't be super simple as well.

There are a few ways to represent it, we would essentially have an array of 7 positions, each position would have a number that represents the opening hours of that day. The number would be a bitmap, so we would have 24 bits, each bit would represent an hour of the day, if the bit is set to 1, it means that the restaurant is open in that hour, if it's set to 0, it means that the restaurant is closed in that hour.

> We could increase the precision of the times by adding more bits, so instead of having 24 bits, we could have 48 bits, each bit would represent 30 minutes of the day, so we could represent the opening hours with a precision of 30 minutes. Or if we would like to have a precision of 5 minutes we could have 288 bits, each bit would represent 5 minutes of the day.

It's rare that we would need more than 5 minutes of resolution, so if we divide all the minutes in one day by 5 minute intervals we would have 288 bits, so we would need 36 bytes to represent the opening hours of a restaurant in a single day. But this wouldn't account for overlapping timespans, so the solution would be to represent the whole week.

One week has 7 days, each day with 288 bits, so we would need 2016 bits to represent the opening hours of a restaurant in a week using 5 minutes of resolution. This would be 252 bytes, which is a lot of data, but it's still a lot less than the current input format (the example JSON has around 900 bytes).

```js
const resolution = 3600 // 1 hour
const totalBits = (60 * 60 * 24 * 7) / resolution //168
const totalBytes = totalBits / 8 //21
const bitsPerDay = (60 * 60 * 24) / resolution //24
const bytesPerDay = bitsPerDay / 8 //3
// 8388608 4194304 2097152 1048576 524288 262144 131072 65536  32768 16384 8192 4096 2048 1024 512 256  128 64 32 16 8 4 2 1
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Sunday 0-23]
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Monday 0-23]
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Tuesday 0-23]
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Wednesday 0-23]
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Thursday 0-23]
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Friday 0-23]
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Saturday 0-23]

// Monday from 22 to Tuesday 1 AM would flip 4 bits (22, 23, 0, 1) -> 4 bits in 2 bytes
// 0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 1 1 -> 24 bits in 3 bytes (1 day) [Monday 0-23] (this is 3 in decimal)
// 1 1 0 0 0 0 0 0  0 0 0 0 0 0 0 0  0 0 0 0 0 0 0 0 -> 24 bits in 3 bytes (1 day) [Tuesday 0-23] (this is 192 in decimal)
const weekBuffer = Buffer.alloc(totalBytes)
const dataview = new DataView(weekBuffer.buffer)
dataview.setUint8(1 * bytesPerDay + 2, 0b00000011)
dataview.setUint8(2 * bytesPerDay, 0b11000000)
dataview
	.getUint8(1 * bytesPerDay)
	.toString(2)
	.padStart(8, '0') // 00000011
dataview
	.getUint8(2 * bytesPerDay)
	.toString(2)
	.padStart(8, '0') // 11000000
```

As you can see, the code is super complex both to parse and to understand, but it's very efficient in terms of space. The algorithm to parse it would be something like this:

1. Create a buffer from the received input which would be a single hex number
2. Iterate through the buffer as if it's a single array of bits
3. At the first bit that is set to 1, we would start counting the bits until we find a bit that is set to 0
4. The index of the first bit that is set to 1 would be the opening time, the index of the first bit that is set to 0, subtracting 1, would be the closing time
5. To find the day of the week, we would divide the index of the first bit that is set to 1 by the number of bits in a day, and we would floor the result, this would give us the index of the day of the week

- In the example, the first bit that is set to 1 is the 46th bit, we then divide it by 24 (the number of bits in a day) which gives us 1.91, we then floor it which gives us 1, which is the index of the day of the week (Monday)

6. To find the opening hour, we subtract from the index of the first bit that is set to 1 the number of the bits in a day, so in the example, we would subtract 24 from 46 and then get the modulus by 24 `(46-24)%24`, which gives us 22, which is the opening time of the restaurant (10PM)
7. To find the closing hour, we subtract from the index of the last bit that's set to 1 the number of the bits in a day, so in the example, we would subtract 24 from 49 would give us 25, if we perform the modulus by 24 `(49-24)%24` we would get 1, which is the closing time of the restaurant (1AM) on the same index

We can repeat the steps from 3 to 7 until we reach the end of the buffer, this way we would be able to parse the whole week.

> I didn't fully implemented this or gave it much though as it would be too difficult not only to parse it back but to also generate the input, but it's a very interesting way to represent the opening hours of a restaurant. I'm thinking on implementing and writing about this (bitmaps) in the future.
