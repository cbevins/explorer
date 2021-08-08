import { GeoBounds, GeoServerGrid } from '../Geo'
import { FireStatus } from './FireStatus.js'

// Cell traversal source and direction enums
export const North = 0
export const NorthEast = 1
export const East = 2
export const SouthEast = 3
export const South = 4
export const SouthWest = 5
export const West = 6
export const NorthWest = 7
export const Origin = 8
export const oppositeDir = [South, SouthWest, West, NorthWest, North, NorthEast, East, SouthEast, South]
export const Unvisited = 9
export const DirAbbr = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'O', 'UV']
export const DirName = ['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest', 'Origin', 'Unvisited']

class Location {
  constructor (dist, time, source, towards) {
    this.dist = dist
    this.time = time
    this.source = source
    this.towards = towards
  }
}

/**
 * IgnitionGrid contains the distance and time required for a fire to spread
 * from a single ignition point at the grid origin to every other point on the grid.
 * Calculations are based on the provided FireEllipse
 * under constant burning conditions for a specified burning period.
 * Grid spacing is provided by the GeoServerGrid (probably a GeoFireGrid) reference.
 *
 * IgnitionGrids should be created and cached by an IgnitionGridProvider,
 * and NOT by a GeoFireGrid.
 *
 * The GeoFireGrid requests an IgnitionGrid from the IgnitionGridProvider
 * for every ignition point during a burning period.
 */
export class IgnitionGrid extends GeoServerGrid {
  constructor (fireGrid, fireEllipse) {
    const length = fireEllipse.length()
    const halfX = fireGrid.xSpacing() * (Math.ceil(length / fireGrid.xSpacing()) + 1)
    const halfY = fireGrid.ySpacing() * (Math.ceil(length / fireGrid.ySpacing()) + 1)
    const bounds = new GeoBounds(-halfX, halfY, halfX, -halfY, fireGrid.xSpacing(), fireGrid.ySpacing())
    super(bounds, null)
    this._ellipse = fireEllipse
    this._fireGrid = fireGrid
    this._log = [] // for debugging and tracking purposes only
    this._walk = {} // walk stats
    this.initDistTime()
  }

  // Returns the distance of point [x, y] from the ignition point
  // NOTE: [x, y] must be snapped to grid points!!
  distanceTo (x, y) { return this.get(x, y).dist }

  // Sets all point distances and ignition times
  initDistTime () {
    this.eachDatum((x, y, status) => {
      const beta = this._ellipse.betaPoint(x, y) // { radians, ratio, rate, dist, time }
      this.set(x, y, new Location(beta.dist, beta.time, Unvisited, Unvisited))
    })
  }

  // Sets all points to Unvisited
  initUnvisited () {
    this.eachDatum((x, y, beta) => {
      beta.source = Unvisited
      beta.towards = Unvisited
      this.set(x, y, beta)
    })
  }

  // Either logs the *msg*, or returns the current log contents
  log (msg) {
    if (msg === undefined) return this._log.join('\n')
    this._log.push(msg)
  }

  // Returns the [x, y] of the [sourceX, sourceY] point's neighbor to the *towards* direction
  neighboringPoint (sourceX, sourceY, towards) {
    if (towards === North) return [sourceX, sourceY + this.ySpacing()]
    if (towards === South) return [sourceX, sourceY - this.ySpacing()]
    if (towards === East) return [sourceX + this.xSpacing(), sourceY]
    if (towards === West) return [sourceX - this.xSpacing(), sourceY]
    if (towards === NorthEast) return [sourceX + this.xSpacing(), sourceY + this.ySpacing()]
    if (towards === SouthEast) return [sourceX + this.xSpacing(), sourceY - this.ySpacing()]
    if (towards === NorthWest) return [sourceX - this.xSpacing(), sourceY + this.ySpacing()]
    if (towards === SouthWest) return [sourceX - this.xSpacing(), sourceY - this.ySpacing()]
  }

  // Returns the *source* direction from which point [x, y] was traversed during the walk()
  source (x, y) { return this.get(x, y).source }

  // Sets the *source* direction from which point [x, y] was traversed during the walk()
  setSource (x, y, source) {
    const data = this.get(x, y)
    data.source = source
    this.set(x, y, data)
    return this
  }

  // Returns the fire arrival *time* of point [x, y]
  timeTo (x, y) { return this.get(x, y).time }

  // Returns the current direction *towards* which point [x, y] is traversing during the walk()
  towards (x, y) { return this.get(x, y).towards }

  // Attempts to recursively traverse the IgnitionGrid from [sourceX, sourceY] *towards* a direction
  traverse (sourceX, sourceY, towards, depth) {
    // runaway truck ramp
    if (depth > 300) throw Error('walk() depth exceeds 300')
    this._walk.points.tested++

    // Get the neighboring point's coordinates within the IgnitionGrid
    const [x, y] = this.neighboringPoint(sourceX, sourceY, towards)
    this.log(`${depth}: Attempt TRAVERSE source [${sourceX}, ${sourceY}] towards ${DirAbbr[towards]} into [${x}, ${y}]`)

    // Get the neighboring point's coordinates within the FireGrid
    const fx = this._walk.ignition.x + x
    const fy = this._walk.ignition.y + y
    let here = `Ign [${x}, ${y}] Fire [${fx}, ${fy}]`
    let msg = `${depth}: RETREAT from ${here}:`

    // Test 1 - the neighboring point must be in the IgnitionGrid bounds
    if (!this.inbounds(x, y)) {
      this.log(`${msg} is out of IgnitionGrid bounds`)
      return false
    }

    // Neighboring point is in-bounds, so get its ignition data {dist, time, source, towards}
    const xCol = this.xCol(x)
    const yRow = this.yRow(y)
    const ign = this.get(x, y)
    here = `Ign [${x}, ${y}] [${xCol}, ${yRow}], Fire [${fx}, ${fy}] d=${ign.dist.toFixed(2)}, t=${ign.time.toFixed(2)}`
    msg = `${depth}: RETREAT from ${here}:`

    // Test 2 - neighboring point must be unvisited on this walk()
    if (ign.source !== Unvisited) {
      this.log(`${msg} was previously visited`)
      return false
    }

    // Test 3 - neighboring point must be in the FireGrid bounds
    if (!this._fireGrid.inbounds(fx, fy)) {
      this.log(`${msg} is out of FireGrid bounds`)
      return false
    }

    // Test 4 - neighboring point must be reachable from ignition pt during the current period
    const arrives = this._walk.ignition.time + ign.time
    if (arrives >= this._walk.period.ends()) {
      this.log(`${msg} ignites at ${arrives}, after period ends`)
      return false
    }

    // Test 5 - neighboring point must be Burnable
    const status = this._fireGrid.status(fx, fy)
    if (status <= FireStatus.Unburnable) {
      this.log(`${msg} FireGrid status ${status} is Unburnable`)
      return false
    }

    // Test 6 - neighboring point must not have burned in a PREVIOUS period
    if (status !== FireStatus.Unburned && status < this._walk.period.begins()) {
      this.log(`${msg} was previously burned at ${status}`)
      return false
    }

    // This point is traversable; set its 'source', which also flags it as Visited
    const source = oppositeDir[towards]
    this.setSource(x, y, source)
    this._walk.points.traversed++

    // If the neighboring point is currently unignited...
    if (status === FireStatus.Unburned) {
      this._fireGrid.set(fx, fy, arrives)
      this.log(`${depth}: IGNITED ${here} at ${this._walk.ignition.time} + ${ign.time} = ${arrives}`)
      this._walk.points.ignited++
      // this._burnMap[xCol + yRow * this.cols()] = '*'
    } else if (arrives < status) {
      this._fireGrid.set(fx, fy, arrives)
      this.log(`${depth}: IGNITED EARLIER ${here} at ${this._walk.ignition.time} + ${ign.time} = ${arrives}`)
      this._walk.points.ignitedEarlier++
    } else {
      this.log(`${depth}: CROSSED ${here}, previously ignited at ${status}`)
      this._walk.points.crossed++
    }

    // Continue traversal by visiting all three neighbors
    ;[North, East, South, West].forEach(towards => {
      if (towards !== source) this.traverse(x, y, towards, depth + 1)
    })
    return true
  }

  walk (fireIgnX, fireIgnY, fireIgnTime, period) {
    this._log = []
    this._walk = {
      ignition: {
        x: fireIgnX,
        y: fireIgnY,
        time: fireIgnTime
      },
      period: period,
      points: {
        ignGrid: this.cols() * this.rows(),
        tested: 0,
        traversed: 0,
        ignited: 0,
        ignitedEarlier: 0,
        crossed: 0
      }
    }
    // Temporary for debugging purposes
    // this._burnMap = new Array(this.rows() * this.cols()).fill('-')

    this.initUnvisited()
    this.setSource(0, 0, Origin)
    ;[North, East, South, West].forEach(towards => {
      this.traverse(0, 0, towards, 0)
    })
  }
}
