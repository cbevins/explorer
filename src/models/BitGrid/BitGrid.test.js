import { BitGrid } from './BitGrid.js'

// function dec2bin (dec) { return (dec >>> 0).toString(2) }

// Since our bit vector is stored in a single number, we simply initialize it as 0.
// const vec = buildVector(64)
test('BitGrid', () => {
  const grid = new BitGrid(1000, 1000)
  expect(grid.get(200, 700)).toEqual(false)
  expect(grid.get(500, 500)).toEqual(false)

  grid.set(200, 700)
  expect(grid.get(200, 700)).toEqual(true)
  expect(grid.get(500, 500)).toEqual(false)

  grid.clear(200, 700)
  expect(grid.get(200, 700)).toEqual(false)
  expect(grid.get(500, 500)).toEqual(false)
})

test('2: Javascript bit operators', () => {
  // These are from https://www.w3schools.com/js/js_bitwise.asp, but ~5 produces -6, NOT 10

  // AND: Sets each bit to 1 if both bits are 1
  expect(5 & 1).toEqual(1) // 0101 & 0001 => 0001

  // OR: Sets each bit to 1 if one of two bits is 1
  expect(5 | 1).toEqual(5) // 0101 | 0001 => 0101

  // XOR: Sets each bit to 1 if only one of two bits is 1
  expect(5 ^ 1).toEqual(4) // 0101 ^ 0001 => 0100

  // Zero fill left shift: Shifts left by pushing zeros in from the right,
  // and let the leftmost bits fall off
  expect(5 << 1).toEqual(10) // 0101 << 1 => 1010

  // Signed right shift: Shifts right by pushing copies of the leftmost bit in from the left,
  // and let the rightmost bits fall off
  expect(5 >> 1).toEqual(2) // 0101 >> 1=> 0010

  // Zero fill right shift: Shifts right by pushing zeros in from the left,
  // and let the rightmost bits fall off
  expect(5 >>> 1).toEqual(2) // 0101 >>> 1 => 0010

  // Using '>>> 0' forces the number to an unsigned integer
  // console.log(`5: '${dec2bin(5)}'`)
  expect(5 >>> 0).toEqual(5) // 0101 >>> 0 => 0101
  // console.log(`-5: '${dec2bin(-5)}'`)
  expect(-5 >>> 0).toEqual(4294967291) // 0101 >>> 0 => 11111111111111111111111111111011

  // JavaScript stores numbers as 64 bits floating point numbers, but all bitwise operations are performed on 32 bits binary numbers.
  // Before a bitwise operation is performed, JavaScript converts numbers to 32 bits signed integers.
  // After the bitwise operation is performed, the result is converted back to 64 bits JavaScript numbers.

  // NOT: Inverts all the bit
  // console.log(`~5: '${dec2bin(~5)}'`)
  // expect(~5).toEqual(10) // ~0101 => 1010
  expect(~5).toEqual(-6) // ~0101 => 11111111111111111111111111111010
  // The examples above uses 4 bits unsigned binary numbers. Because of this ~ 5 returns 10.
  // Since JavaScript uses 32 bits signed integers, it will not return 10. It will return -6.
  // 00000000000000000000000000000101 (5)
  // 11111111111111111111111111111010 (~5 = -6)
  // A signed integer uses the leftmost bit as the minus sign.
})

test('3: TwoBit', () => {
  const b2 = new Uint32Array(4)
  b2[0] = 0
  b2[1] = 1
  b2[2] = 2
  b2[3] = 3
  expect(b2[2]).toEqual(2)
})
