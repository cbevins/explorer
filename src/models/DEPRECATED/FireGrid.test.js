import { FireGrid } from './FireGrid.js'

test('1: FireGrid constructor', () => {
  const fire = new FireGrid(100, 100)
  expect(fire.cells()).toEqual(10000)
  expect(fire._data[0]).toEqual(0)
  expect(fire.status(0, 0)).toEqual(0)
  for (let row = 0; row < fire.rows(); row++) {
    for (let col = 0; col < fire.cols(); col++) {
      expect(fire.isBurnable(col, row)).toEqual(true)
    }
  }
})

test('2: FireGrid.setUnburnableCol(), setUnburnableRow(), isUnburnableColRow()', () => {
  const fire = new FireGrid(100, 100)
    .setUnburnableRow(25, 25, 75)
    .setUnburnableCol(25, 25, 75)
  expect(fire.isUnburnable(25, 50)).toEqual(true)
  expect(fire.isUnburnable(50, 25)).toEqual(true)
  expect(fire.isUnburnable(50, 50)).toEqual(false)
  // console.log(fire.toString('Pre-Fire with Unburnable Col and Row'))
})

test('3: FireGrid.strike()', () => {
  const fire = new FireGrid(100, 100)
    .setUnburnableRow(25, 25, 75)
    .setUnburnableCol(25, 25, 75)
    .strike(50, 50)

  // set a fire strike at 50, 50 at period 1
  expect(fire.isBurned(50, 50)).toEqual(false) // Period was still at 0 during strike
  fire.incrementPeriod()
  fire.strike(50, 50)
  expect(fire.isBurned(50, 50)).toEqual(true)
  expect(fire.status(50, 50)).toEqual(1)
  expect(fire.isBurned(51, 50)).toEqual(false)
  expect(fire.status(51, 50)).toEqual(0)

  // Start a new burn period 2
  fire.burn()
  expect(fire.isBurned(51, 50)).toEqual(true)
  expect(fire.status(51, 50)).toEqual(2)
  expect(fire.status(50, 50)).toEqual(1)

  fire.burn()
  fire.burn()
  fire.burn()
  // console.log(fire.toString('Strike at 50, 50 with Unburnable Col and Row'))
})

test('4: FireGrid Tinker Toy()', () => {
  const fire = new FireGrid(100, 100)
  fire.setUnburnableRow(25, 25, 75)
  fire.setUnburnableCol(25, 25, 75)
  fire.incrementPeriod()
  fire.strike(50, 50)
  expect(fire.status(50, 50)).toEqual(1)
  expect(fire.getIgnCells().size).toEqual(4)
  fire.burn()
  // console.log(fire.toString('Strike at 50, 50 with Unburnable Col and Row'))
})
