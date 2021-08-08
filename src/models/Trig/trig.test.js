import { angle, azimuthOf, caz2rot, rad2deg, rot2caz } from './index.js'

test('1: trig.js angle(), rad2deg()', () => {
  // Clockwise sweep starting at north
  expect(rad2deg(angle(0, 10, 0, 10))).toBeCloseTo(0, 12)
  expect(rad2deg(angle(0, 10, 10, 10))).toBeCloseTo(45, 12)
  expect(rad2deg(angle(0, 10, 10, 0))).toBeCloseTo(90, 12)
  expect(rad2deg(angle(0, 10, 10, -10))).toBeCloseTo(135, 12)
  expect(rad2deg(angle(0, 10, 0, -10))).toBeCloseTo(180, 12)
  expect(rad2deg(angle(0, 10, -10, -10))).toBeCloseTo(225, 12)
  expect(rad2deg(angle(0, 10, -10, 0))).toBeCloseTo(270, 12)
  expect(rad2deg(angle(0, 10, -10, 10))).toBeCloseTo(315, 12)
  // Reverse [x1,y1] and [x2,y2]
  expect(rad2deg(angle(10, 10, 0, 10))).toBeCloseTo(315, 12)
  expect(rad2deg(angle(10, 0, 0, 10))).toBeCloseTo(270, 12)
  expect(rad2deg(angle(10, -10, 0, 10))).toBeCloseTo(225, 12)
  expect(rad2deg(angle(0, -10, 0, 10))).toBeCloseTo(180, 12)
  expect(rad2deg(angle(-10, -10, 0, 10))).toBeCloseTo(135, 12)
  expect(rad2deg(angle(-10, 0, 0, 10))).toBeCloseTo(90, 12)
  expect(rad2deg(angle(-10, 10, 0, 10))).toBeCloseTo(45, 12)
})

test('2: trig.js caz2rot()', () => {
  expect(caz2rot(0)).toEqual(90)
  expect(caz2rot(45)).toEqual(45)
  expect(caz2rot(90)).toEqual(0)
  expect(caz2rot(135)).toEqual(315)
  expect(caz2rot(180)).toEqual(270)
  expect(caz2rot(225)).toEqual(225)
  expect(caz2rot(270)).toEqual(180)
  expect(caz2rot(315)).toEqual(135)
  expect(caz2rot(360)).toEqual(90)

  expect(rot2caz(90)).toEqual(0)
  expect(rot2caz(45)).toEqual(45)
  expect(rot2caz(0)).toEqual(90)
  expect(rot2caz(315)).toEqual(135)
  expect(rot2caz(270)).toEqual(180)
  expect(rot2caz(225)).toEqual(225)
  expect(rot2caz(180)).toEqual(270)
  expect(rot2caz(135)).toEqual(315)
  expect(rot2caz(90)).toEqual(0)
})

test('3: trig.js azimuthOf()', () => {
  // Quadrant 1 (NE): x-positive, y-positive
  expect(azimuthOf(0, 10)).toEqual(0) // north
  expect(azimuthOf(10, 10)).toEqual(45)// north-east
  expect(azimuthOf(10, 0)).toEqual(90) // east
  // Quadrant 2 (SE): x-positive, y-negative
  expect(azimuthOf(10, -0)).toEqual(90) // east
  expect(azimuthOf(10, -10)).toEqual(135) // south-east
  expect(azimuthOf(0, -10)).toEqual(180) // south
  // Quadrant 3 (SW): x-negative, y-negative
  expect(azimuthOf(-0, -10)).toEqual(180) // south
  expect(azimuthOf(-10, -10)).toEqual(225) // south-west
  expect(azimuthOf(-10, -0)).toEqual(270) // west
  // Quadrant 4 (NW): x-negative, y-positive
  expect(azimuthOf(-10, 0)).toEqual(270) // west counter-clockwise from east
  expect(azimuthOf(-10, 10)).toEqual(315) // north-west counter-clockwise from east
  expect(azimuthOf(-0, 10)).toEqual(0) // north-west counter-clockwise from east
})
