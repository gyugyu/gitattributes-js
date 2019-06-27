import { parse } from './index'

test('parse simple attributes', () => {
  const attrs = parse('*.sln       merge=binary')
  expect(attrs).toEqual([
    { pattern: '*.sln', attributes: { merge: 'binary' } }
  ])
})
