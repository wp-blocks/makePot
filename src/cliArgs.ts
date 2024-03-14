import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { stringstring } from './utils'
import * as path from 'path'
import * as process from 'process'
import { DEFAULT_EXCLUDED_PATH } from './const'
import { Args, DomainType } from './types'
import fs, { accessSync } from 'node:fs'

function isThemeOrPlugin(currentPath: string = '/', slug: string) {
	const currentWorkingDirectory = currentPath

	try {
		accessSync(
			path.join(currentWorkingDirectory, slug + '.php'),
			fs.constants.R_OK
		)
		return 'plugin'
	} catch (err) {
		// do nothing
		console.log(
			'the current working directory ' +
				currentWorkingDirectory +
				' does not contain a ' +
				slug +
				'.php file'
		)
	}

	try {
		accessSync(
			path.join(currentWorkingDirectory, 'style.css'),
			fs.constants.R_OK
		)
		return 'theme'
	} catch (err) {
		// do nothing
		console.log(
			'the current working directory ' +
				currentWorkingDirectory +
				' does not contain a style.css file'
		)
	}

	if (currentWorkingDirectory.includes('themes')) {
		return 'theme'
	} else if (currentWorkingDirectory.includes('plugins')) {
		return 'plugin'
	}
	return 'generic'
}

/**
 * Retrieves and returns the command line arguments and options.
 *
 * @return The parsed command line arguments and options.
 */
export function getArgs() {
	const args = yargs(hideBin(process.argv))
		.help('h')
		.alias('help', 'help')
		.usage('Usage: $0 <source> [destination] [options]')
		.positional('sourceDirectory', {
			describe: 'Source directory',
			type: 'string',
		})
		.positional('destination', {
			describe: 'Destination directory',
			type: 'string',
		})
		.options({
			slug: {
				describe: 'Plugin or theme slug',
				type: 'string',
			},
			domain: {
				describe: 'Text domain to look for in the source code',
				type: 'string',
			},
			'skip-js': {
				describe: 'Skip JavaScript files',
				type: 'boolean',
			},
			'skip-php': {
				describe: 'Skip PHP files',
				type: 'boolean',
			},
			'skip-blade': {
				describe: 'Skip Blade files',
				type: 'boolean',
			},
			'skip-block-json': {
				describe: 'Skip block.json files',
				type: 'boolean',
			},
			'skip-theme-json': {
				describe: 'Skip theme.json files',
				type: 'boolean',
			},
			'skip-audit': {
				describe: 'Skip auditing of strings',
				type: 'boolean',
			},
			headers: {
				describe: 'Headers',
				type: 'string',
			},
			'file-comment': {
				describe: 'File comment',
				type: 'string',
			},
			'package-name': {
				describe: 'Package name',
				type: 'string',
			},
			location: {
				describe: 'Include location information',
				type: 'boolean',
			},
			'ignore-domain': {
				describe: 'Ignore text domain',
				type: 'boolean',
			},
			mergePaths: {
				describe: 'Merge with existing POT file(s)',
				type: 'string',
			},
			subtractPaths: {
				describe: 'Subtract strings from existing POT file(s)',
				type: 'string',
			},
			subtractAndMerge: {
				describe:
					'Subtract and merge strings from existing POT file(s)',
				type: 'boolean',
			},
			include: {
				describe: 'Include specific files',
				type: 'string',
			},
			exclude: {
				describe: 'Exclude specific files',
				type: 'string',
			},
			silent: {
				describe: 'No output to stdout',
				type: 'boolean',
			},
			json: {
				describe: 'Output the json gettext data',
				type: 'boolean',
			},
			output: {
				describe: 'Output the gettext data',
				type: 'boolean',
			},
		})
		.parseSync()
	return parseCliArgs(args)
}

/**
 * Parses the command line arguments and returns an object with the parsed values.
 *
 * @param {{_: string[]}} args - The command line arguments to be parsed.
 * @return {object} - An object with the parsed values from the command line arguments.
 */
export function parseCliArgs(
	args: yargs.PositionalOptions & yargs.Options & yargs.Arguments
): Args {
	// Get the input and output paths
	const inputPath: string = typeof args._[0] === 'string' ? args._[0] : '.'
	const outputPath: string = typeof args._[1] === 'string' ? args._[1] : '.'
	const currentWorkingDirectory = process.cwd()
	const slug =
		args.slug && typeof args.slug === 'string'
			? args.slug
			: path.basename(path.resolve(currentWorkingDirectory, inputPath))
	const cwd = path.relative(currentWorkingDirectory, inputPath)
	const out = path.relative(currentWorkingDirectory, outputPath)

	/** get the domain to look for (plugin, theme, etc) */
	const domain =
		(args?.domain as DomainType) ?? isThemeOrPlugin(path.resolve(cwd), slug)

	const parsedArgs: Args = {
		slug: slug,
		domain: domain,
		paths: { cwd: cwd, out: out },
		options: {
			ignoreDomain: !!args?.ignoreDomain,
			packageName: String(args.packageName ?? ''),
			silent: !!args.silent,
			json: !!args.json,
			location: !!args?.location,
			output: !!args?.output,
			// Config: skip, comment and package name
			skip: {
				js: !!args.skipJs,
				php: !!args.skipPhp,
				blade: !!args.skipBlade,
				blockJson: !!args.skipBlockJson,
				themeJson: !!args.skipThemeJson,
				audit: !!args.skipAudit,
			},
		},
		// Headers
		headers: {
			fileComment: (args.fileComment as string) ?? '',
		},
		// Patterns
		patterns: {
			mergePaths: stringstring(args.mergePaths as string) ?? [],
			subtractPaths: stringstring(args.subtractPaths as string) ?? [],
			subtractAndMerge: !!args.subtractAndMerge,
			include: stringstring(args.include as string) ?? ['**'],
			exclude:
				stringstring(args.exclude as string) ?? DEFAULT_EXCLUDED_PATH,
		},
	}

	parsedArgs.paths.root = args.root ? String(args.root) : undefined

	return parsedArgs
}
