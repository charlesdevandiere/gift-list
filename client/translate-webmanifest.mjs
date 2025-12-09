import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2)
const locale = args[1] ?? 'fr-FR'
const file = resolve(`./dist/gift-list/browser/${locale}/gift-list.webmanifest`)

console.log(`Translate webmanifest for locale: ${locale}.`)

const rawWebmanifest = await readFile(file, { encoding: 'utf-8' })
const webmanifest = JSON.parse(rawWebmanifest)

if (locale === 'fr-FR') {
  webmanifest.name = 'Liste de cadeaux'
  webmanifest.short_name = 'Liste de cadeaux'
  webmanifest.description = 'Partagez votre liste de cadeaux avec votre famille !'
  webmanifest.shortcuts[0].name = "Panier"
}
// support other locale here

const data = JSON.stringify(webmanifest, null, 2)
await writeFile(file, data, 'utf-8')
console.log(file)
