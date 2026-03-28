# Guidelines when using Npm or Npx

Follow these guidelines when running any command with `npm` or `npx`

## Always use script for package.json first

If you want to run a command, always look for the scripts in `package.json` and use those scripts instead of running raw `npx` commands

## Errors are errors independently of status code

If a command shows errors, but the status code is not of an error, treat it as failing and fix the errors.
