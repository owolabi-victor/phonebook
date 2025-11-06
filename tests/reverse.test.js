// tests/reverse.test.js
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

import utils from '../utils/for_testing.js'   // import the object
const { reverse } = utils                     // pull out reverse function

test('reverse of a', () => {
  const result = reverse('a')

  strictEqual(result, 'a')
})

test('reverse of react', () => {
  const result = reverse('react')

  strictEqual(result, 'tcaer')
})

test('reverse of saippuakauppias', () => {
  const result = reverse('saippuakauppias')

  strictEqual(result, 'saippuakauppias')
})