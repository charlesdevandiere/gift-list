import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import source from './src/locale/messages.json' with { type: 'json' };

const args = process.argv.slice(2)
const locale = args[1] ?? 'fr-FR'
const file = resolve(`./src/locale/messages.${locale}.json`)

console.log(`Prepare translation file for locale: ${locale}.`)

const { default: previous } = await import(file, { with: { type: 'json' } })

const target = {
  locale: locale,
  translations: {
    ...source.translations
  }
}

if (previous?.translations) {
  for (const key in target.translations) {
    if (previous.translations[key]) {
      target.translations[key] = previous.translations[key]
    }
  }
}

const data = JSON.stringify(target, null, 2)
await writeFile(file, data, 'utf-8')
console.log(file)
