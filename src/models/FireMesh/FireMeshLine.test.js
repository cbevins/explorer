/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { FireMeshLine } from './FireMeshLine.js'

test('1: FireMeshLine constructor() and accessors', () => {
  const dflt = new FireMeshLine()
  expect(dflt.anchor()).toEqual(0)
  expect(dflt.segments()).toEqual([])

  const horz = new FireMeshLine(4000)
  expect(horz.anchor()).toEqual(4000) // y-position of this horizontal scanline
  expect(horz.segments()).toEqual([])

  const vert = new FireMeshLine(1000)
  expect(vert.anchor()).toEqual(1000) // x-position of this vertical scanline
  expect(vert.segments()).toEqual([])
})

test('2: FireMeshLine igniteAt(), segment()', () => {
  const horz = new FireMeshLine(4000)
  expect(horz.isBurnableAt(1500)).toEqual(true)
  expect(horz.isBurnedAt(1500)).toEqual(false)
  expect(horz.isUnburnableAt(1500)).toEqual(false)
  expect(horz.isUnburnedAt(1500)).toEqual(true)

  expect(horz.igniteAt(1500)).toEqual(true)
  expect(horz.isBurnableAt(1500)).toEqual(true)
  expect(horz.isBurnedAt(1500)).toEqual(true)
  expect(horz.isUnburnableAt(1500)).toEqual(false)
  expect(horz.isUnburnedAt(1500)).toEqual(false)
  expect(horz.segments().length).toEqual(1)
  expect(horz.segment(0).begins()).toEqual(1500)

  // Should return false since x 1500 is no longer unburned
  expect(horz.igniteAt(1500)).toEqual(false)
  expect(horz.segments().length).toEqual(1)

  // Add segment at end of array
  expect(horz.igniteAt(1700)).toEqual(true)
  expect(horz.segments().length).toEqual(2)
  expect(horz.segment(0).begins()).toEqual(1500)
  expect(horz.segment(1).begins()).toEqual(1700)

  // Add segment at middle of array
  expect(horz.igniteAt(1600)).toEqual(true)
  expect(horz.segments().length).toEqual(3)
  expect(horz.segment(0).begins()).toEqual(1500)
  expect(horz.segment(1).begins()).toEqual(1600)
  expect(horz.segment(2).begins()).toEqual(1700)

  // Add segment to front (west/left or north/top) of array
  expect(horz.igniteAt(1400)).toEqual(true)
  expect(horz.segments().length).toEqual(4)
  expect(horz.segment(0).begins()).toEqual(1400)
  expect(horz.segment(1).begins()).toEqual(1500)
  expect(horz.segment(2).begins()).toEqual(1600)
  expect(horz.segment(3).begins()).toEqual(1700)

  // Add segment to back (east/right or bottom/south) of array
  expect(horz.igniteAt(1800)).toEqual(true)
  expect(horz.segments().length).toEqual(5)
  expect(horz.segment(0).begins()).toEqual(1400)
  expect(horz.segment(1).begins()).toEqual(1500)
  expect(horz.segment(2).begins()).toEqual(1600)
  expect(horz.segment(3).begins()).toEqual(1700)
  expect(horz.segment(4).begins()).toEqual(1800)
})

test('3: FireMeshLine overlayBurned() without Unburnables', () => {
  const line = new FireMeshLine(4000)
  expect(line.segments().length).toEqual(0)

  // Add a first segment
  line.overlayBurned(50, 55)
  expect(line.segments().length).toEqual(1)
  expect(line.segment(0).begins()).toEqual(50)
  expect(line.segment(0).ends()).toEqual(55)

  // Add segment prceeding all others
  line.overlayBurned(30, 35)
  expect(line.segments().length).toEqual(2)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(50)
  expect(line.segment(1).ends()).toEqual(55)

  // Add segment following all others
  line.overlayBurned(70, 75)
  expect(line.segments().length).toEqual(3)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(50)
  expect(line.segment(1).ends()).toEqual(55)
  expect(line.segment(2).begins()).toEqual(70)
  expect(line.segment(2).ends()).toEqual(75)

  // Overlay segment before-within a middle segment
  line.overlayBurned(40, 52)
  expect(line.segments().length).toEqual(3)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(40)
  expect(line.segment(1).ends()).toEqual(55)
  expect(line.segment(2).begins()).toEqual(70)
  expect(line.segment(2).ends()).toEqual(75)

  // Overlay a segment within-after a middle segment
  line.overlayBurned(45, 60)
  expect(line.segments().length).toEqual(3)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(40)
  expect(line.segment(1).ends()).toEqual(60)
  expect(line.segment(2).begins()).toEqual(70)
  expect(line.segment(2).ends()).toEqual(75)

  // Overlay a segment within-within a middle segment
  line.overlayBurned(50, 55)
  expect(line.segments().length).toEqual(3)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(40)
  expect(line.segment(1).ends()).toEqual(60)
  expect(line.segment(2).begins()).toEqual(70)
  expect(line.segment(2).ends()).toEqual(75)

  // Overlay a segment preceeds and follows a middle segment
  line.overlayBurned(39, 61)
  expect(line.segments().length).toEqual(3)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(39)
  expect(line.segment(1).ends()).toEqual(61)
  expect(line.segment(2).begins()).toEqual(70)
  expect(line.segment(2).ends()).toEqual(75)

  // Overlay a segment that preceeds AND follows two segments
  line.overlayBurned(38, 76)
  expect(line.segments().length).toEqual(2)
  expect(line.segment(0).begins()).toEqual(30)
  expect(line.segment(0).ends()).toEqual(35)
  expect(line.segment(1).begins()).toEqual(38)
  expect(line.segment(1).ends()).toEqual(76)

  // Overlay a segment that preceeds AND follows ALL segments
  line.overlayBurned(10, 90)
  expect(line.segments().length).toEqual(1)
  expect(line.segment(0).begins()).toEqual(10)
  expect(line.segment(0).ends()).toEqual(90)

  // Overlay a segment that attaches to end of eisting segment
  line.overlayBurned(90, 95)
  expect(line.segments().length).toEqual(1)
  expect(line.segment(0).begins()).toEqual(10)
  expect(line.segment(0).ends()).toEqual(95)

  // Overlay a segment that attaches to beginning of eisting segment
  line.overlayBurned(5, 15)
  expect(line.segments().length).toEqual(1)
  expect(line.segment(0).begins()).toEqual(5)
  expect(line.segment(0).ends()).toEqual(95)

  // Add a bunch of segments
  for (let b = 0; b < 100; b++) {
    const begins = 100 + b * 10
    line.overlayBurned(begins, begins + 5)
  }
  expect(line.segments().length).toEqual(101)

  // Overlay a segment that overlaps 50 segments
  line.overlayBurned(350, 850)
  expect(line.segments().length).toEqual(51)
  expect(line.segment(0).begins()).toEqual(5)
  expect(line.segment(0).ends()).toEqual(95)
  expect(line.segment(26).begins()).toEqual(350)
  expect(line.segment(26).ends()).toEqual(855)
  expect(line.segment(27).begins()).toEqual(860)
  expect(line.segment(27).ends()).toEqual(865)
  /*
    Period 5 Ign Pt [1636.25, 4392.00] IgnEllipse y -36.00 x 31.49 to 35.12
    Overlay Line 194 y 4356 seg 1667.74 to 1671.37
    Line 194 now has 3 segments:
        [1608.54, 1612.17]
        [1625.97, 1640.50]
        [1667.74, 1671.37]

    Period 5 Ign Pt [1569.85, 4391.00] IgnEllipse y -35.00 x 28.85 to 36.06
    Overlay Line 194 y 4356 seg 1598.70 to 1605.91
    Line 194 now has 4 segments:
        [1608.54, 1612.17]
        [1625.97, 1640.50]
        [1598.70, 1605.91]
        [1667.74, 1671.37]
 */

  /*
    Period 5 Ign Pt [1637.83, 4389.00] IgnEllipse y -33.00 x 25.19 to 36.30
    Overlay Line 194 y 4356 seg 1663.02 to 1674.13
    Line 194 now has 4 segments:
        [1608.54, 1612.17]
        [1625.97, 1640.50]
        [1597.41, 1608.51]
        [1663.02, 1674.13]

    Period 5 Ign Pt [1573.40, 4388.00] IgnEllipse y -32.00 x 23.65 to 36.13
    Overlay Line 194 y 4356 seg 1597.05 to 1609.53
    Line 194 now has 3 segments:
        [1597.05, 1609.53]
        [1597.41, 1608.51]
        [1663.02, 1674.13]
*/
})

test('4: FireMeshLine overlayBurned() error 1', () => {
  // This was the overlay sequence that lead to the error
  const p4 = [
    [1608.54, 1612.17],
    [1625.97, 1640.50],
    [1667.74, 1671.37],
    [1598.70, 1605.91]
  ]
  const p5 = [
    [1663.02, 1674.13],
    [1597.05, 1609.53]
  ]
  const line = new FireMeshLine(4000)
  expect(line.segments().length).toEqual(0)

  line.overlayBurned(1608.54, 1612.17)
  expect(line.segments().length).toEqual(1)

  line.overlayBurned(1625.97, 1640.50)
  expect(line.segments().length).toEqual(2)

  line.overlayBurned(1667.74, 1671.37)
  expect(line.segments().length).toEqual(3)

  line.overlayBurned(1598.70, 1605.91)
  expect(line.segments().length).toEqual(4)
  expect(line.segment(0).endpoints()).toEqual([1598.70, 1605.91])
  expect(line.segment(1).endpoints()).toEqual([1608.54, 1612.17])
  expect(line.segment(2).endpoints()).toEqual([1625.97, 1640.50])
  expect(line.segment(3).endpoints()).toEqual([1667.74, 1671.37])

  line.overlayBurned(1663.02, 1674.13)
  expect(line.segments().length).toEqual(4)
  expect(line.segment(0).endpoints()).toEqual([1598.70, 1605.91])
  expect(line.segment(1).endpoints()).toEqual([1608.54, 1612.17])
  expect(line.segment(2).endpoints()).toEqual([1625.97, 1640.50])
  expect(line.segment(3).endpoints()).toEqual([1663.02, 1674.13])

  line.overlayBurned(1597.05, 1609.53)
  expect(line.segments().length).toEqual(3)
  expect(line.segment(0).endpoints()).toEqual([1597.05, 1612.17])
  expect(line.segment(1).endpoints()).toEqual([1625.97, 1640.50])
  expect(line.segment(2).endpoints()).toEqual([1663.02, 1674.13])
})
