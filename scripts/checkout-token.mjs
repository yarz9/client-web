import { readFile, writeFile } from 'node:fs/promises'

const PATH = 'src/app/pages/Checkout.tsx'
let source = await readFile(PATH, 'utf8')

function edit(name, find, replace) {
  const matches = source.match(new RegExp(find.source, find.flags.includes('g') ? find.flags : find.flags + 'g')) ?? []
  if (matches.length !== 1) throw new Error(`${name}: expected 1 match, found ${matches.length}`)
  source = source.replace(find, () => replace)
}

edit(
  'keep the tracking token',
  /const body = await\s+response\.json\(\) as \{ reference\?: string; error\?: string; subtotal\?: number \}/,
  'const body = await response.json() as { reference?: string; error?: string; subtotal?: number; trackToken?: string }',
)

edit(
  'stop storing personal data',
  /name: form\.name\.trim\(\),\s*phone: form\.phone\.trim\(\),\s*city: form\.city\.trim\(\),\s*address: form\.address\.trim\(\),\s*/,
  "trackToken: body.trackToken ?? '',\n        ",
)

edit(
  'greet without stored name',
  /const name = state\?\.customer\.name \?\? saved\?\.name \?\? ''/,
  "const name = state?.customer.name ?? ''",
)

edit(
  'handle a missing name',
  />Hvala, \{name\}\. Plaćanje je pouzećem\./,
  ">Hvala{name ? ', ' + name : ''}. Plaćanje je pouzećem.",
)

await writeFile(PATH, source, 'utf8')
console.log('Checkout patched: tracking token kept, personal data no longer stored.')
