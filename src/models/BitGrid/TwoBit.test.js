/* eslint-disable jest/prefer-to-have-length */
// import { TwoBit } from './TwoBit.js'

// https://www.codementor.io/@erikeidt/bit-twiddling-understanding-bit-operations-iqj68ynb7

function dec2bin (dec) { return (dec >>> 0).toString(2).padStart(32, '0') }

const b2 = new Uint32Array(2)
const mask = [
  0b00000000000000000000000000000011, // 0 1+2 = 3
  0b00000000000000000000000000001100, // 1 4 + 8
  0b00000000000000000000000000110000, // 2 16 + 32
  0b00000000000000000000000011000000, // 3 64 + 128
  0b00000000000000000000001100000000, // 4 256 + 512
  0b00000000000000000000110000000000, // 5 1024 + 2048
  0b00000000000000000011000000000000, // 6
  0b00000000000000001100000000000000, // 7
  0b00000000000000110000000000000000, // 8
  0b00000000000011000000000000000000, // 9
  0b00000000001100000000000000000000, // 10
  0b00000000110000000000000000000000, // 11
  0b00000011000000000000000000000000, // 12
  0b00001100000000000000000000000000, // 13
  0b00110000000000000000000000000000, // 14
  0b11000000000000000000000000000000 // 15
]
const ones = 0b11111111111111111111111111111111
const zeros = 0b00000000000000000000000000000000
const n0123 = 0b00011011000110110001101100011011
const target = 0b00011011000110110001101100101011

// The values are, from right-to-left...
const nvals = [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0]

// Method 1: left shift, then right shift
// Requires no mask
function getFieldMethod1 (idx, unit32) {
  const right = 30 // always shift right 30
  const left = 32 - 2 * (idx + 1)
  return (unit32 << left) >>> right
}

// Extraction Method 2: right shift then masking AND
// Requires just a single mask, '11' (3)
function getFieldMethod2 (idx, unit32) {
  const right = 2 * idx
  return (unit32 >> right) & mask[0]
}

// Method 3: masking AND, then right shift
// Requires a mask for each field idx
function getFieldMethod3 (idx, unit32) {
  const right = 2 * idx
  return (unit32 & mask[idx]) >>> right
}

// let str = `All Zeros     ${zeros.toString().padStart(10)} (${dec2bin(zeros)})\n`
// mask.forEach((m, idx) => { str += `Mask bits ${idx.toString().padStart(2)}: ${m.toString().padStart(10)} (${dec2bin(m)})\n` })
// str += `All Ones      ${ones.toString().padStart(10)} (${dec2bin(ones)})\n`
// console.log(str)

test('TwoBit', () => {
  expect(b2.length).toEqual(2)
  expect(b2[0]).toEqual(0)
  expect(~b2[0]).toEqual(-1)
  b2[0] = 3
  expect(b2[0]).toEqual(3)
  expect(b2[0] >>> 0).toEqual(3)
  //
  // const ones = ~0 >>> 32
  // console.log('0 >>> 32 =', dec2bin(0 >>> 32))
  // console.log('~0 >>> 32 =', dec2bin(ones))
  // console.log('ones <<< 16 >>> 32 =', dec2bin(~0 >>> 32))
  // console.log(0b1111111111111111)
  expect(~0 >>> 32).toEqual(2 ** 32 - 1)
  expect((b2[0] << 30) >>> 30).toEqual(3)
})

test('TwoBit extraction from mask', () => {
  // Method 1: left shift, then right shift
  mask.forEach((m, field) => {
    expect(getFieldMethod1(field, ones)).toEqual(3)
    expect(getFieldMethod1(field, zeros)).toEqual(0)
    expect(getFieldMethod1(field, n0123)).toEqual(nvals[field])
  })
  // Method 2: right shift, then mask with mask[0]
  mask.forEach((m, field) => {
    expect(getFieldMethod2(field, ones)).toEqual(3)
    expect(getFieldMethod2(field, zeros)).toEqual(0)
    expect(getFieldMethod2(field, n0123)).toEqual(nvals[field])
  })
  // Method 3: masking AND, then right shift
  mask.forEach((m, field) => {
    expect(getFieldMethod3(field, ones)).toEqual(3)
    expect(getFieldMethod3(field, zeros)).toEqual(0)
    expect(getFieldMethod3(field, n0123)).toEqual(nvals[field])
  })
})

function setField (idx, uint32, val) {
  return uint32 & (~(3 << (idx * 2))) | (val << (idx * 2))
}

test('4: Setting fields', () => {
  expect(n0123).toEqual(454761243)
  // The first 5 2-bit fields are 3, 0, 1, 2, 3: '11 00 01 10 11'
  // Attempt to set field 2 (1: '01') to 2: '10' to end up with '11 00 10 10 11'
  let str = `${dec2bin(n0123)} : start pattern: bits 4-5 (field 2) are 1: '01'\n`
  str += `${dec2bin(3 << 4)} : 3 << 4 creates a set mask in bits 4-5 (field 2)\n`
  str += `${dec2bin(~(3 << 4))} : ~(3 << 4) inverts the mask in bits 4-5 (field 2)\n`
  str += `${dec2bin(n0123 & (~(3 << 4)))} : start & ~(3 << 4)) clears set bits 4-5 (field 2) from start and preserves others\n`
  str += `${dec2bin(2 << 4)} : 2 << 4 creates a set mask of desired value '2' shifted left into bits 4-5 (field 2)\n`
  str += `${dec2bin((n0123 & (~(3 << 4)) | (2 << 4)))} : start & (~(3 << 4) | (2 << 4) ORs the cleared and value (2) masks\n`
  str += `${dec2bin(target)} : target: bits 4-5 (field 2) are 2: '10'\n`
  str += `${dec2bin(setField(2, n0123, 2))} : setField(2, start, 2)\n`
  str += `${dec2bin(setField(2, n0123, 3))} : setField(2, start, 3)\n`
  str += `${dec2bin(setField(2, n0123, 1))} : setField(2, start, 1)\n`
  str += `${dec2bin(setField(2, n0123, 0))} : setField(2, start, 0)\n`
  console.log(str)
})
