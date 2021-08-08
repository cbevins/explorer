import { FireGrid } from './FireGrid.js'
import { GridWalker } from './GridWalker.js'

test('1: GridWalker constructor', () => {
  const walkerGrid = new GridWalker(5, 5)
  expect(walkerGrid._open.cells()).toEqual(25)
  expect(walkerGrid._source.cells()).toEqual(25)
})

test('2: GridWalker full walk', () => {
  const walkerGrid = new GridWalker(5, 5)
  expect(walkerGrid._open.cells()).toEqual(25)
  const fire = new FireGrid(5, 5)
  fire.reset()
  // console.log(fire.toString('Fire After init()'))
  fire.setUnburnableCells([[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]])
  // console.log(fire.toString('Fire After setUnburnable()'))
  fire.burn(2, 2)
  // console.log(fire.toString('Fire After startIgnition()'))
})

test('3: GridWalker blocked walk', () => {
  const walkerGrid = new GridWalker(5, 5)
  expect(walkerGrid._open.cells()).toEqual(25)

  const fire = new FireGrid(5, 5)
  fire.reset()
  fire.setUnburnableCells([[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]])
  // console.log(fire.toString('Blocked Walk after setUnburnable()'))
  fire.burn(2, 2)
  // console.log(fire.toString('Blocked Walk after startIgnition()'))
})

test('4: GridWalker Hole-in-the-Wall Walk', () => {
  const walkerGrid = new GridWalker(5, 5)
  expect(walkerGrid._open.cells()).toEqual(25)

  const fire = new FireGrid(5, 5)
  fire.reset()
  fire.setUnburnableCells([[1, 1], [1, 2], [1, 3], [1, 4]])
  // console.log(fire.toString('Hole-in-the-Wall Walk after setUnburnable()'))
  fire.burn(2, 2)
  // console.log(fire.toString('Hole-in-the-Wall Walk after startIgnition()'))
})
