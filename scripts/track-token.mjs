import { readFile, writeFile } from 'node:fs/promises'

async function patch(path, edits) {
  let source = await readFile(path, 'utf8')
  for (const [name, find, replace] of edits) {
    const matches = source.match(new RegExp(find.source, find.flags.includes('g') ? find.flags : find.flags + 'g')) ?? []
    if (matches.length !== 1) throw new Error(`${path} ${name}: expected 1 match, found ${matches.length}`)
    source = source.replace(find, () => replace)
  }
  await writeFile(path, source, 'utf8')
  console.log(path + ': ' + edits.length + ' edits')
}

await patch('server/index.ts', [
  [
    'return the token to a verified visitor',
    /return c\.json\(\{\s*reference: row\.reference,/,
    `return c.json({\n    trackToken: trackTokenFor(reference),\n    reference: row.reference,`,
  ],
])

await patch('src/app/pages/OrderTracking.tsx', [
  [
    'accept a tracking token in the response',
    /trackingCode: string\s*subtotal: number/,
    `trackingCode: string\n  trackToken?: string\n  subtotal: number`,
  ],
  [
    'pick the order that still needs a phone check',
    /\n  const needle = query\.trim\(\)\.toLowerCase\(\)/,
    `\n  const pendingPhone = phoneTarget || orders.find(order => !order.trackToken)?.reference || ''\n  const needle = query.trim().toLowerCase()`,
  ],
  [
    'verify the pending order',
    /if \(!phoneTarget \|\| digits\.length < 6\)/,
    'if (!pendingPhone || digits.length < 6)',
  ],
  [
    'check the pending order against the server',
    /requestTracking\(phoneTarget, \{ phone: digits \}\)/,
    'requestTracking(pendingPhone, { phone: digits })',
  ],
  [
    'store the token after a phone check',
    /patchOrder\(tracked\.reference, \{ status: tracked\.status \}\)\s*setOrders\(loadOrders\(\)\)\s*setPhoneTarget\(''\)/,
    `patchOrder(tracked.reference, { status: tracked.status, trackToken: tracked.trackToken || undefined })\n      setOrders(loadOrders())\n      setPhoneTarget('')`,
  ],
  [
    'show the phone form for orders without a token',
    /\{phoneTarget \? \(/,
    '{pendingPhone ? (',
  ],
  [
    'name the pending order in the form',
    /Potvrdite narudžbu \{phoneTarget\}/,
    'Potvrdite narudžbu {pendingPhone}',
  ],
  [
    'keep the token from a manual lookup',
    /subtotal: tracked\.subtotal,\s*status: tracked\.status,/,
    `subtotal: tracked.subtotal,\n          status: tracked.status,\n          trackToken: tracked.trackToken,`,
  ],
])
