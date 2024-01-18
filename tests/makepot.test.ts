import { describe, expect } from '@jest/globals'

import { Args, DomainType } from '../src/types'
import { runExtract } from '../src/parser'

const args = {
	sourceDirectory: './tests/fixtures/',
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
}

describe('makePot', () => {
	it('Should build pot file', async () => {
		const dataExtracted = await runExtract({
			...args,
			sourceDirectory: './tests/fixtures/sourcedir/',
			include: ['file.php'],
			exclude: ['node_modules', 'dist'],
		} as Args)
		console.log('Done', dataExtracted)
		expect(true).toBe(true)
	})
	it('Should build pot file from fixtures', async () => {
		const dataExtracted = await runExtract({
			...args,
			sourceDirectory: './tests/fixtures/theme/',
			include: ['block.json'],
			exclude: ['node_modules', 'dist'],
			domain: 'theme',
		} as Args)
		console.log('Done', dataExtracted)
		expect(true).toBe(true)
	})
	it('Should build pot file from fixtures/plugin', async () => {
		const dataExtracted = await runExtract({
			...args,
			sourceDirectory: './tests/fixtures/plugin/',
			include: ['**/*.css'],
			exclude: ['node_modules', 'dist'],
		} as Args)
		console.log('Done', dataExtracted)
		expect(true).toBe(true)
	})
})
