import { GeoFireGrid } from './GeoFireGrid.js'
// import { FireStatus } from '../FireStatus.js'
import { FireInputProviderMock } from '../FireBehavior/index.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 10
const ydist = 10
const fireInputProvider = new FireInputProviderMock()

function run (steps, duration) {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)
    .setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750

  // Ignite a single point at time 0
  gf.igniteAt(1500, 4500, 0)

  // Keep burning until no more ignition points
  for (let p = 0; p < steps; p++) {
    if (!gf.burnForPeriod(duration)) break
  }

  console.log(gf.periodStats())
  console.log(gf.rows(), 'rows,', gf.cols(), 'cols,', gf.rows() * gf.cols(), ' pts')
}

console.time('GeoFireGrid')
run(60 * 24, 1)
console.timeEnd('GeoFireGrid')
