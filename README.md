# Openning times

> Technical assignment for Wolt

## Table of Contents

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Openning times](#openning-times)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Technical remarks](#technical-remarks)

<!-- /code_chunk_output -->

## Description

This is a simple application that takes a JSON file as an input and outputs the opening hours of a restaurant in a human readable format.

## Technical remarks

- I'm using Node 20.6+ with ES6 modules so we have the latest features of the language.
- I'm using the Node's native test runner for testing, not because I don't like Jest, but because I always try to reduce the amount of external dependencies in my projects.
  - I'm using the `--experimental-test-coverage` to collect the coverage data. However, it's the same as if I used `nyc` or `c8` to collect the coverage data.
  - Tests are executed directly in the TypeScript files through pre-parsing via `tsx` loaders directly in Node, since this application doesn't require the use of environment variables, we can use it directly in the command as `node --experimental-loader=tsx --test ./src/index.ts`. However if we required envs, we could add `NODE_OPTIONS='--import=tsx' node --test --env-file=.env ./src/index.ts`.
  - Node 20 [seems to have support for glob patterns](https://github.com/nodejs/node/pull/47653#issuecomment-1793514839) but it doesn't seem to be working properly, so they [moved it to v21](https://nodejs.org/en/blog/announcements/v21-release-announce#support-for-globs-in-the-nodejs-test-runner) to avoid using a current version and use LTS I'm also using `glob` to find the files to test.
