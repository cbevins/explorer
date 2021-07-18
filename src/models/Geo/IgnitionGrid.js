import { GeoBounds } from './GeoBounds.js'
import { GeoServerGrid } from './GeoServerGrid.js'
import { FireStatus } from './FireStatus.js'

// Cell traversal source and direction enums
export const North = 0
export const East = 1
export const South = 2
export const West = 3
export const Origin = 4
export const oppositeDir = [South, West, North, East, South]
export const Unvisited = 5

class Location {
  constructor (dist, time, from, towards) {
    this.dist = dist
    this.time = time
    this.from = from
    this.towards = towards
  }
}

/**
 * IgnitionGrid contains the distance and time required for a fire to spread
 * from a single ignition point at the grid origin to every other point on the grid.
 * Calculations are based on the provided FireEllipse
 * under constant burning conditions for a specified burning period.
 * Grid spacing is provided by the GeoServerGrid (probably a GeoFireGrid) reference.
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
    this.initDistTime()
    console.log(`Ignition Grid has ${this.cols()} cols and ${this.rows()} rows`)
  }

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
      beta.from = Unvisited
      beta.towards = Unvisited
      this.set(x, y, beta)
    })
  }

  // Returns the distance of point [x, y] from the ignition point
  // NOTE: [x, y] must be snapped to grid points!!
  distTo (x, y) { return this.get(x, y).dist }

  // Returns the direction *from* which point [x, y] was traversed during the walk()
  from (x, y) { return this.get(x, y).from }

  // Sets the direction *from* which point [x, y] was traversed during the walk()
  setFrom (x, y, from) {
    const data = this.get(x, y)
    data.from = from
    this.set(x, y, data)
    return this
  }

  // Returns the fire arrival *time* of point [x, y]
  timeTo (x, y) { return this.get(x, y).time }

  // Returns the current direction *towards* which point [x, y] is traversing
  towards (x, y) { return this.get(x, y).towards }

  neighboringPoint (fromX, fromY, towards) {
    if (towards === North) return [fromX, fromY + this.ySpacing()]
    if (towards === South) return [fromX, fromY - this.ySpacing()]
    if (towards === East) return [fromX + this.xSpacing(), fromY]
    if (towards === West) return [fromX - this.xSpacing(), fromY]
  }

  traverse (fromX, fromY, towards, depth) {
    // console.log(fromX, fromY, towards, depth)
    if (depth > 300) throw Error('walk() depth exceeds 100')
    // Get the neighboring point coordinates in the IgnitionGrid
    const [x, y] = this.neighboringPoint(fromX, fromY, towards)
    this.fire.tested++

    // 1 - point must be in the IgnitionGrid bounds
    if (!this.inbounds(x, y)) {
      console.log(`GO BACK: IgnitionGrid [${x}, ${y}] is out of IgnitionGrid bounds`)
      return false
    }

    // In-bounds, so get the ignition data
    const ign = this.get(x, y)
    // Get the neighboring point coordinates in the FireGrid
    const fx = this.fire.x + x
    const fy = this.fire.y + y

    // 2 - point must be unvisited on this walk
    if (ign.from !== Unvisited) {
      console.log(`GO BACK: IgnitionGrid [${x}, ${y}] was previously visited`)
      return false
    }

    // 3 - point must be in the FireGrid bounds
    if (!this._fireGrid.inbounds(fx, fy)) {
      console.log(`GO BACK: FireGrid [${fx}, ${fy}] is out of Fire Grid bounds`)
      return false
    }

    // 4 - point must be reachable by fire during current period
    const arrives = this.fire.time + ign.time
    // if (arrives >= this.fire.period.ends()) {
    //   console.log(`FireGrid [${fx}, ${fy}] ignites at ${arrives}, after period ends`)
    //   return false
    // }

    // 5 - point must be Burnable
    const status = this._fireGrid.status(fx, fy)
    if (status <= FireStatus.Unburnable) {
      console.log(`GO BACK: FireGrid [${fx}, ${fy}] status ${status} is Unburnable`)
      return false
    }

    // 6 - point must not have burned in a PREVIOUS period
    if (status !== FireStatus.Unburned && status < this.fire.period.begins()) {
      console.log(`GO BACK: FireGrid [${fx}, ${fy}] was burned in a previous period at ${status}`)
      return false
    }

    // This point is traversable; set its 'from', which also flags it as Visited
    const from = oppositeDir[towards]
    this.setFrom(x, y, from)
    this.fire.traversed++

    // Update point's scheduled ignition time if it is Unburned or scheulded later
    if (status === FireStatus.Unburned || arrives < status) {
      this._fireGrid.set(this.fire.x, this.fire.y, arrives)
      this.fire.burned++
      console.log(`GO AHEAD: FireGrid [${fx}, ${fy}] ignited at ${arrives}`)
    }

    // Continue traversal by visitng all three neighbors
    ;[North, East, South, West].forEach(towards => {
      if (towards !== from) this.traverse(x, y, towards, depth + 1)
    })
    return true
  }

  walk (fireIgnX, fireIgnY, fireIgnTime, period) {
    // We can save the fire ignition point properties since they don't change during the walk
    this.fire = {
      x: fireIgnX,
      y: fireIgnY,
      time: fireIgnTime,
      period: period,
      points: this.cols() * this.rows(),
      tested: 0,
      traversed: 0,
      burned: 0
    }
    this.initUnvisited()
    this.setFrom(0, 0, Origin)
    ;[North, East, South, West].forEach(towards => {
      this.traverse(0, 0, towards, 0)
    })
    console.log('Burn Period Results', this.fire)
  }
}
