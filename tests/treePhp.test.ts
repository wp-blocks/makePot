import { doTree } from '../src/tree'
import path from 'path'
import fs from 'fs'

describe('doTree php', () => {
	it('Should build pot file', () => {
		const filePath = path.join(
			process.cwd(),
			'tests/fixtures/sourcedir/file.php'
		)
		const fileContent = fs.readFileSync(filePath, 'utf8')
		console.log('My file path is: ' + filePath)
		const fileParsed = doTree(fileContent, 'tests/fixtures/php.php')

		expect(fileParsed).toMatchSnapshot()
	})

	it('Should build pot file php', () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/sourcedir/file.php'),
			'utf8'
		)
		const fileParsed = doTree(
			fileContent,
			'tests/fixtures/sourcedir/file.php'
		)

		expect(fileParsed).toMatchSnapshot()
	})
})
