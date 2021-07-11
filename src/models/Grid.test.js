import { Grid } from './Grid.js'

test('1: Grid constructor, cols(), rows(), cells()', () => {
  const grid = new Grid(3, 4)
  expect(grid.cols()).toEqual(3)
  expect(grid.rows()).toEqual(4)
  expect(grid.cells()).toEqual(12)
  expect(grid.getCell(0)).toBeUndefined()
})

test('2: Grid.inbounds()', () => {
  const grid = new Grid(3, 4, 9)
  expect(grid.inbounds(0, 0)).toEqual(true)
  expect(grid.inbounds(2, 3)).toEqual(true)
  expect(grid.inbounds(-1, 0)).toEqual(false)
  expect(grid.inbounds(0, -1)).toEqual(false)
  expect(grid.inbounds(3, 0)).toEqual(false)
  expect(grid.inbounds(0, 4)).toEqual(false)
})

test('3: Grid.idx()', () => {
  const grid = new Grid(3, 4, 9)
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

  // over and under flows
  expect(() => { grid.idx(3, 0) }).toThrow()
  expect(() => { grid.idx(-1, 0) }).toThrow()
  expect(() => { grid.idx(0, 9) }).toThrow()
  expect(() => { grid.idx(0, -1) }).toThrow()
})

test('5: Grid.col()', () => {
  const grid = new Grid(3, 4, 9)
  expect(grid.col(0)).toEqual(0)
  expect(grid.col(1)).toEqual(1)
  expect(grid.col(2)).toEqual(2)
  expect(grid.col(3)).toEqual(0)
  expect(grid.col(4)).toEqual(1)
  expect(grid.col(5)).toEqual(2)
  expect(grid.col(6)).toEqual(0)
  expect(grid.col(6.1)).toEqual(0)
  expect(grid.col(6.9)).toEqual(0)
  expect(grid.col(7)).toEqual(1)
  expect(grid.col(8)).toEqual(2)
  expect(grid.col(9)).toEqual(0)
  expect(grid.col(10)).toEqual(1)
  expect(grid.col(11)).toEqual(2)

  // over and under flows
  expect(() => { grid.col(12) }).toThrow()
  expect(() => { grid.col(-1) }).toThrow()
})

test('6: Grid.colRow()', () => {
  const grid = new Grid(3, 4, 9)
  expect(grid.colRow(0)).toEqual([0, 0])
  expect(grid.colRow(1)).toEqual([1, 0])
  expect(grid.colRow(2)).toEqual([2, 0])
  expect(grid.colRow(3)).toEqual([0, 1])
  expect(grid.colRow(4)).toEqual([1, 1])
  expect(grid.colRow(5)).toEqual([2, 1])
  expect(grid.colRow(6)).toEqual([0, 2])
  expect(grid.colRow(7)).toEqual([1, 2])
  expect(grid.colRow(8)).toEqual([2, 2])
  expect(grid.colRow(9)).toEqual([0, 3])
  expect(grid.colRow(10)).toEqual([1, 3])
  expect(grid.colRow(11)).toEqual([2, 3])
})

test('7: Grid.getCell(), getColrow(), setCell(), setColRow()', () => {
  const grid = new Grid(3, 4, 9)
  expect(grid.getCell(7)).toEqual(9)
  expect(grid.setCell(7, 777).getCell(7)).toEqual(777)
  expect(grid.colRow(7)).toEqual([1, 2])
  expect(grid.getColRow(1, 2)).toEqual(777)

  expect(grid.setColRow(1, 2, 888).getColRow(1, 2)).toEqual(888)
  expect(grid.idx(1, 2)).toEqual(7)
  expect(grid.getCell(7)).toEqual(888)

  expect(() => { grid.setColRow(-1, 2, 888) }).toThrow()
  expect(() => { grid.setColRow(1, -1, 888) }).toThrow()
  expect(() => { grid.setColRow(9, 1, 888) }).toThrow()
  expect(() => { grid.setColRow(1, 9, 888) }).toThrow()

  expect(() => { grid.getColRow(-1, 2) }).toThrow()
  expect(() => { grid.getColRow(1, -1) }).toThrow()
  expect(() => { grid.getColRow(9, 1) }).toThrow()
  expect(() => { grid.getColRow(1, 9) }).toThrow()

  expect(() => { grid.setCell(-1, 888) }).toThrow()
  expect(() => { grid.setCell(99, 888) }).toThrow()
  expect(() => { grid.getCell(-1) }).toThrow()
  expect(() => { grid.getCell(99) }).toThrow()
})
