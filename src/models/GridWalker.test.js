import { FireGrid } from './FireGrid.js'
import { GridWalker } from './GridWalker.js'

test('1: GridWalker constructor', () => {
  const walkerGrid = new GridWalker(5, 5)
  expect(walkerGrid._open.cells()).toEqual(25)
  expect(walkerGrid._source.cells()).toEqual(25)

  const fire = new FireGrid(5, 5)
  fire.init()
  console.log(fire.toString('Fire After init()'))
  fire.setUnburnable([[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]])
  console.log(fire.toString('Fire After setUnburnable()'))
  fire.startIgnition(2, 2, walkerGrid)
  console.log(walkerGrid._source.toString('Walker'))
  console.log(fire.toString('Fire After startIgnition()'))
})
