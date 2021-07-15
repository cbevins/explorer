import { GeoBounds } from './GeoBounds.js'
import { GeoServerGrid } from './GeoServerGrid.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 10
const ydist = 20
const bounds = new GeoBounds(west, north, east, south, xdist, ydist)

test('1: GeoServerGrid constructor and accessors', () => {
  const gs = new GeoServerGrid(bounds, 9)
  expect(gs.bounds().west()).toEqual(west)
  expect(gs.bounds().north()).toEqual(north)
  expect(gs.bounds().east()).toEqual(east)
  expect(gs.bounds().south()).toEqual(south)
  expect(gs.bounds().xSpacing()).toEqual(10)
  expect(gs.bounds().ySpacing()).toEqual(20)

  expect(gs.defaultValue()).toEqual(9)
  expect(gs.guarded()).toEqual(true)

  expect(gs.cols()).toEqual(101)
  expect(gs.rows()).toEqual(51)
  expect(gs.cells()).toEqual(5151)
  expect(gs.data() instanceof Array).toEqual(true)
  expect(gs.data()).toHaveLength(5151)
  expect(gs.data()[1234]).toEqual(9)
})

test('2: GeoServerGrid col(), row()', () => {
  const gs = new GeoServerGrid(bounds, 9)

  // xSpacing is 10 ...
  expect(gs.bounds().xSpacing()).toEqual(10)

  expect(gs.xCol(1500)).toEqual(50)
  expect(gs.xCol(1505 - 1e-10)).toEqual(50)
  expect(gs.xCol(1495)).toEqual(49)

  expect(gs.xCol(1490)).toEqual(49)
  expect(gs.xCol(1485)).toEqual(48)
  expect(gs.xCol(1490 - 1e-10)).toEqual(48)

  // ySpacing is 20 ...
  expect(gs.bounds().ySpacing()).toEqual(20)
  expect(gs.yRow(5000)).toEqual(0)
  expect(gs.yRow(4980 + 1e-10)).toEqual(0)

  expect(gs.yRow(4980)).toEqual(1)
  expect(gs.yRow(4960 + 1e-10)).toEqual(1)

  expect(gs.yRow(4500)).toEqual(25)
  expect(gs.yRow(4480 + 1e-10)).toEqual(25)

  // Out-of-bounds
  expect(() => gs.xCol(999)).toThrow()
  expect(() => gs.xCol(2001)).toThrow()
  expect(() => gs.yRow(5001)).toThrow()
  expect(() => gs.yRow(3999)).toThrow()
})

test('3: Grid.idx()', () => {
  const bounds = new GeoBounds(0, 3, 2, 0, 1, 1)
  const grid = new GeoServerGrid(bounds, 9)
  expect(grid.idx(0, 0)).toEqual(0)
  expect(grid.idx(1, 0)).toEqual(1)
  expect(grid.idx(2, 0)).toEqual(2)
  expect(grid.idx(0, 1)).toEqual(3)
  expect(grid.idx(1, 1)).toEqual(4)
  expect(grid.idx(2, 1)).toEqual(5)
  expect(grid.idx(0, 2)).toEqual(6)
  expect(grid.idx(1, 2)).toEqual(7)
  expect(grid.idx(2, 2)).toEqual(8)
  expect(grid.idx(0, 3)).toEqual(9)
  expect(grid.idx(1, 3)).toEqual(10)
  expect(grid.idx(2, 3)).toEqual(11)

  // While getting the [col, row] of [x,y] IS guarded,
  // subsequenct access to idx via [col, row] is NOT guarded
  expect(() => { grid.idx(3, 0) }).not.toThrow()
  expect(() => { grid.idx(-1, 0) }).not.toThrow()
  expect(() => { grid.idx(0, 9) }).not.toThrow()
  expect(() => { grid.idx(0, -1) }).not.toThrow()
})

test('4: GeoServerGrid.get(), set()', () => {
  const gs = new GeoServerGrid(bounds, 9)
  expect(gs.bounds().cols()).toEqual(101)
  expect(gs.bounds().rows()).toEqual(51)

  const x = 1500
  const y = 4500
  expect(gs.xCol(x)).toEqual(50)
  expect(gs.yRow(y)).toEqual(25)
  expect(gs.idx(gs.xCol(x), gs.yRow(y))).toEqual(50 + 25 * 101)
  expect(gs.get(x, y)).toEqual(9)

  expect(gs.set(x, y, 1)).toEqual(gs)
  expect(gs.get(x, y)).toEqual(1)
  expect(gs.get(gs.westOf(x), y)).toEqual(9)
  expect(gs.get(gs.eastOf(x), y)).toEqual(9)
  expect(gs.get(x, gs.northOf(y))).toEqual(9)
  expect(gs.get(x, gs.southOf(y))).toEqual(9)

  // Set neighborhhod values
  gs.set(x, gs.northOf(y), 'N')
    .set(x, gs.southOf(y), 'S')
    .set(gs.westOf(x), y, 'W')
    .set(gs.eastOf(x), y, 'E')
    .set(gs.westOf(x), gs.northOf(y), 'NW')
    .set(gs.westOf(x), gs.southOf(y), 'SW')
    .set(gs.eastOf(x), gs.northOf(y), 'NE')
    .set(gs.eastOf(x), gs.southOf(y), 'SE')
    .set(x, y, 'C')

  // Indiviudal point access
  expect(gs.bounds().xSpacing()).toEqual(10)
  expect(gs.bounds().ySpacing()).toEqual(20)
  expect(gs.get(x - 10, y)).toEqual('W')
  expect(gs.get(x - 10, y + 20)).toEqual('NW')
  expect(gs.get(x, y + 20)).toEqual('N')
  expect(gs.get(x + 10, y + 20)).toEqual('NE')
  expect(gs.get(x + 10, y)).toEqual('E')
  expect(gs.get(x + 10, y - 20)).toEqual('SE')
  expect(gs.get(x, y - 20)).toEqual('S')
  expect(gs.get(x - 10, y - 20)).toEqual('SW')
  expect(gs.get(x, y)).toEqual('C')

  // Row access in west-to-east order
  expect(gs.getRow(y + 20, x - 20, x + 20)).toEqual(([9, 'NW', 'N', 'NE', 9]))
  expect(gs.getRow(y, x - 20, x + 20)).toEqual(([9, 'W', 'C', 'E', 9]))
  expect(gs.getRow(y - 20, x - 20, x + 20)).toEqual(([9, 'SW', 'S', 'SE', 9]))

  // Row access in east-to-west order
  expect(gs.getRow(y + 20, x + 20, x - 20)).toEqual([9, 'NE', 'N', 'NW', 9])
  expect(gs.getRow(y, x + 20, x - 20)).toEqual([9, 'E', 'C', 'W', 9])
  expect(gs.getRow(y - 20, x + 20, x - 20)).toEqual([9, 'SE', 'S', 'SW', 9])

  // Column access in north-to-south order
  expect(gs.getCol(x - 10, y + 40, y - 40)).toEqual([9, 'NW', 'W', 'SW', 9])
  expect(gs.getCol(x, y + 40, y - 40)).toEqual([9, 'N', 'C', 'S', 9])
  expect(gs.getCol(x + 10, y + 40, y - 40)).toEqual([9, 'NE', 'E', 'SE', 9])

  // Column access in south-north order
  expect(gs.getCol(x - 10, y - 40, y + 40)).toEqual([9, 'SW', 'W', 'NW', 9])
  expect(gs.getCol(x, y - 40, y + 40)).toEqual([9, 'S', 'C', 'N', 9])
  expect(gs.getCol(x + 10, y - 40, y + 40)).toEqual([9, 'SE', 'E', 'NE', 9])

  // Rectangle access in north-to-south, west-to-east order
  expect(gs.getRect(x - 20, y + 40, x + 20, y - 40)).toEqual([
    9, 9, 9, 9, 9,
    9, 'NW', 'N', 'NE', 9,
    9, 'W', 'C', 'E', 9,
    9, 'SW', 'S', 'SE', 9,
    9, 9, 9, 9, 9])

  // Rectangle access in south-to-north, west-to-east order
  expect(gs.getRect(x - 20, y - 40, x + 20, y + 40)).toEqual([
    9, 9, 9, 9, 9,
    9, 'SW', 'S', 'SE', 9,
    9, 'W', 'C', 'E', 9,
    9, 'NW', 'N', 'NE', 9,
    9, 9, 9, 9, 9])

  // Rectangle access in south-to-north, east-to-west order
  expect(gs.getRect(x + 20, y - 40, x - 20, y + 40)).toEqual([
    9, 9, 9, 9, 9,
    9, 'SE', 'S', 'SW', 9,
    9, 'E', 'C', 'W', 9,
    9, 'NE', 'N', 'NW', 9,
    9, 9, 9, 9, 9])
})
