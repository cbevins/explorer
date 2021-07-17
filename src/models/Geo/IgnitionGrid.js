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
    if (depth > 100) throw Error('walk() depth exceeds 100')
    // Get the neighboring point coordinates in the IgnitionGrid
    const [x, y] = this.neighboringPoint(fromX, fromY, towards)
    const ign = this.get(x, y)
    // Get the neighboring point coordinates in the FireGrid
    const fx = this.fire.x + x
    const fy = this.fire.y + y

    // 1 - point must be in the IgnitionGrid bounds
    if (!this.inbounds(x, y)) return false

    // 2 - point must be unvisited on this walk
    if (ign.from !== Unvisited) return false

    // 3 - point must be in the FireGrid bounds
    if (!this._fireGrid.inbounds(fx, fy)) return false

    // 4 - point must be Burnable
    const status = this._fireGrid.status(fx, fy)
    if (status <= FireStatus.Unburnable) return false

    // 5 - point must not have burned in a PREVIOUS period
    if (status !== FireStatus.Unburned && status < this.fire.period.begins()) return false

    // 6 - point must be reachable by fire during current period
    const arrives = this.fire.time + ign.time
    if (arrives >= this.fire.period.ends()) return false

    // This point is traversable; set its 'from', which also flags it as Visited
    const from = oppositeDir[towards]
    this.setFrom(x, y, from)
    this.fire.walked++

    // Update point's scheduled ignition time if it is Unburned or scheulded later
    if (status === FireStatus.Unburned || arrives < status) {
      this._fireGrid.set(this.fire.x, this.fire.y, arrives)
      this.fire.burned++
      console.log(`Burned ${fx}, ${fy} at ${arrives}`)
    }

    // Continue traversal by visitng all three neighbors
    ;[North, East, South, West].forEach(towards => {
      if (towards !== from) this.traverse(x, y, towards, depth + 1)
    })
    return true
  }

  walk (fireIgnX, fireIgnY, fireIgnTime, period) {
    // We can save the fire ignition point properties since they don't change during the walk
    this.fire = { x: fireIgnX, y: fireIgnY, time: fireIgnTime, period: period, walked: 0, burned: 0 }
    this.initUnvisited()
    this.setFrom(0, 0, Origin)
    ;[North, East, South, West].forEach(towards => {
      this.traverse(0, 0, towards, 0)
    })
    // console.log(this.fire)
  }
}
