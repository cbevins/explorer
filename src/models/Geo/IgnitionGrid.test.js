import { IgnitionGrid, North, South, East, West, Origin, Unvisited } from './IgnitionGrid.js'
import { FireEllipse } from './FireEllipse.js'
import { FireStatus } from './FireStatus.js'
import { GeoFireGrid } from './GeoFireGrid.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 10
const ydist = 10
const fireGrid = new GeoFireGrid(west, north, east, south, xdist, ydist)

const length = 100
const width = 50
const degrees = 135
const time = 1
const fireEllipse0 = new FireEllipse(length, width, 0, time)
const fireEllipse = new FireEllipse(length, width, degrees, time)
// const fe2 = createFireEllipse(headRos, length / width, degrees, time)

// The FireEllipse above has the following properties
const headRos = 93.30127018922192
const backRos = 6.698729810778069
const headX = 65.97396084411709
const headY = -65.97396084411712
const headDist = 93.30127018922192
const backDist = 6.698729810778069
const backX = -4.73671727453765
const backY = 4.73671727453765

test('1: Ensure the FireEllipse are constructed as expected', () => {
  expect(fireEllipse0.headRate()).toBeCloseTo(headRos, 12)
  expect(fireEllipse0.backRate()).toBeCloseTo(backRos, 12)
  expect(fireEllipse0.headDegrees()).toBeCloseTo(0, 12) // degrees from north
  expect(fireEllipse0.hx()).toBeCloseTo(0, 12)
  expect(fireEllipse0.hy()).toBeCloseTo(headDist, 12)
  expect(fireEllipse0.headDist()).toBeCloseTo(headDist, 12)
  expect(fireEllipse0.bx()).toBeCloseTo(0, 12)
  expect(fireEllipse0.by()).toBeCloseTo(-backDist, 12)
  expect(fireEllipse0.backDist()).toBeCloseTo(backDist, 12)
  // console.log(fireEllipse0.betaPoint(0, 10))
  // console.log(fireEllipse0.betaPoint(0, headDist))

  expect(fireEllipse.headRate()).toBeCloseTo(headRos, 12)
  expect(fireEllipse.backRate()).toBeCloseTo(backRos, 12)
  expect(fireEllipse.headDegrees()).toBeCloseTo(135, 12) // degrees from north
  expect(fireEllipse.hx()).toBeCloseTo(headX, 12)
  expect(fireEllipse.hy()).toBeCloseTo(headY, 12)
  expect(fireEllipse.headDist()).toBeCloseTo(headDist, 12)
  expect(fireEllipse.bx()).toBeCloseTo(backX, 12)
  expect(fireEllipse.by()).toBeCloseTo(backY, 12)
  expect(fireEllipse.backDist()).toBeCloseTo(backDist, 12)
  // console.log(fireEllipse.betaPoint(10, -10))
  // console.log(fireEllipse.betaPoint(headX, headY))
})

test('2: Ensure the GeoFireGrid is as expected', () => {
  expect(fireGrid.west()).toEqual(west)
  expect(fireGrid.north()).toEqual(north)
  expect(fireGrid.east()).toEqual(east)
  expect(fireGrid.south()).toEqual(south)
  expect(fireGrid.xSpacing()).toEqual(10)
  expect(fireGrid.ySpacing()).toEqual(10)

  expect(fireGrid.defaultValue()).toEqual(FireStatus.Unburned)
  expect(fireGrid.guarded()).toEqual(true)

  expect(fireGrid.cols()).toEqual(101)
  expect(fireGrid.rows()).toEqual(101)
  expect(fireGrid.cells()).toEqual(10201)
  expect(fireGrid.data() instanceof Array).toEqual(true)
  expect(fireGrid.data()).toHaveLength(10201)
  expect(fireGrid.data()[1234]).toEqual(FireStatus.Unburned)
})

test('3: IgnitionGrid with unrotated FireEllipse', () => {
  const ig = new IgnitionGrid(fireGrid, fireEllipse0)
  expect(ig.bounds().east()).toEqual(110)
  expect(ig.bounds().west()).toEqual(-110)
  expect(ig.bounds().north()).toEqual(110)
  expect(ig.bounds().south()).toEqual(-110)
  expect(ig.cols()).toEqual(23)
  expect(ig.rows()).toEqual(23)

  expect(ig.distTo(0, 0)).toEqual(0)
  expect(ig.timeTo(0, 0)).toEqual(0)

  expect(ig.distTo(0, 10)).toEqual(10)
  expect(ig.timeTo(0, 10)).toBeCloseTo((10 / headRos), 12)
})

test('4: IgnitionGrid rotated to 135 degrees', () => {
  const ig = new IgnitionGrid(fireGrid, fireEllipse)
  expect(ig.bounds().east()).toEqual(110)
  expect(ig.bounds().west()).toEqual(-110)
  expect(ig.bounds().north()).toEqual(110)
  expect(ig.bounds().south()).toEqual(-110)
  expect(ig.cols()).toEqual(23)
  expect(ig.rows()).toEqual(23)

  expect(ig.distTo(0, 0)).toEqual(0)
  expect(ig.timeTo(0, 0)).toEqual(0)

  const dist = Math.sqrt(100 + 100)
  expect(ig.distTo(10, -10)).toBeCloseTo(dist)
  expect(ig.timeTo(10, -10)).toBeCloseTo((dist / headRos), 12)
  // console.log(ig.get(60, -60))
  expect(ig.get(60, -60)).toEqual({
    dist: 84.8528137423857,
    time: 0.9094497167112289,
    from: 5, // Unvisited
    towards: 5 // Unvisited
  })
})

test('5: IgnitionGrid.setFrom(), neighboringPoint()', () => {
  const ig = new IgnitionGrid(fireGrid, fireEllipse)
  expect(ig.get(0, 0).from).toEqual(Unvisited)
  ig.setFrom(0, 0, Origin)
  expect(ig.get(0, 0).from).toEqual(Origin)

  expect(ig.neighboringPoint(0, 0, North)).toEqual([0, 10])
  expect(ig.neighboringPoint(0, 0, South)).toEqual([0, -10])
  expect(ig.neighboringPoint(0, 0, East)).toEqual([10, 0])
  expect(ig.neighboringPoint(0, 0, West)).toEqual([-10, 0])
})

test('6: IgnitionGrid.walk()', () => {
  const ig = new IgnitionGrid(fireGrid, fireEllipse)
  expect(ig.get(0, 0).from).toEqual(Unvisited)
  ig.setFrom(0, 0, Origin)
  expect(ig.get(0, 0).from).toEqual(Origin)

  fireGrid.period().update(1)
  ig.walk(1500, 4500, 0, fireGrid.period())
})
