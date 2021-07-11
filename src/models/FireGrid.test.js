import { FireGrid } from './FireGrid.js'

test('1: FireGrid constructor', () => {
  const fire = new FireGrid(5, 5)
  expect(fire.cells()).toEqual(25)
  fire.init()
  for (let row = 0; row < fire.rows(); row++) {
    for (let col = 0; col < fire.cols(); col++) {
      expect(fire.mayTraverse(col, row)).toEqual(true)
    }
  }
  console.log(fire.toString('Fire Traversal Order'))
})
