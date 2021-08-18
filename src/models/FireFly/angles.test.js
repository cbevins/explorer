/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { destinations } from './angles.js'

test('1: destinations', () => {
  const d = destinations()
  expect(d.length).toEqual(31 * 8 + 8)
})
