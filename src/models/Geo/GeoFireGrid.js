import { GeoBounds } from './GeoBounds.js'
import { GeoCoord } from './GeoCoord.js'
import { GeoServerGrid } from './GeoServerGrid.js'
import { createFireEllipse } from './FireEllipse.js'

/**
 * Burn status enums: anything > 0 is an ignition time
 * All points belong to exactly one burn status category:
 *  - Burnable, which have a non-negative value
 *    - Unburned, whose value is an ignition time of 0
 *    - Burned, whose value is an ignition time > 0
 *  - Unburnable, which has a negative value indicating its type (water, rock, fireline, etc)
 */
export const Unburned = -1
export const Unburnable = -2
export const OutOfBounds = -3
export const ControlLine = -4
export const Water = -5 // snow, ice
export const Rock = -6 // talus, pavement
export const Road = -7 // paved road, unpaved road, double track
export const Trail = -8

export class GeoFireGrid extends GeoServerGrid {
  constructor (west, north, east, south, xspacing, yspacing) {
    const bounds = new GeoBounds(west, north, east, south, xspacing, yspacing)
    super(bounds, Unburned)
    this._ignSet = new Set() // Set of ignition GeoCoords to start each burning period
    this._ign = new GeoCoord(0, 0) // current ignition point [x, y]
    // NOTE that *begins* IS WITHIN the period, while *ends* is NOT WITHIN the period
    this._period = { _begins: 0, _ends: 0, _number: 0 }
  }

  // Determines fire front ignition points and burns them for the duration
  burn (duration) {
    this.periodUpdate()
    const t = this.periodMidpoint()
    this._ignSet = this.getIgnPoints()
    // console.log(`Period ${this.periodNumber()} has ${this._ignSet.size} ignition points`)
    this._ignSet.forEach(([col, row]) => {
      // Step 1 - get fire ellipse parameters for this point and time
      // const ellipse = this.fireProvider().get(x, y, t)
      const ellipse = createFireEllipse(10, 2, duration) // (headRos, lwr, duration)
      // Step 2 - overlay ellipse on ignition point
    })
  }

  // Returns an Set of GeoCoords of Burned points that are adjacent to Unburned Burnable points
  getIgnPoints () {
    const coords = new Set()
    const dx = this.xSpacing()
    const dy = this.ySpacing()
    this.eachDatum((x, y, status) => {
      if (this.isBurnedStatus(status)) {
        if ((this.inbounds(x, y + dy) && this.isUnburned(x, y + dy)) ||
            (this.inbounds(x, y - dy) && this.isUnburned(x, y - dy)) ||
            (this.inbounds(x + dx, y) && this.isUnburned(x + dx, y)) ||
            (this.inbounds(x - dx, y) && this.isUnburned(x - dx, y))) {
          coords.add(new GeoCoord(x, y))
        }
      }
    })
    return coords
  }

  // Ignites the point [x, y] at time t, IFF it is Unburned
  ignite (x, y, t) {
    if (this.isUnburned(x, y)) this.set(x, y, t)
    return this
  }

  // Returns TRUE if point [x, y] is Unburned or Burned
  isBurnable (x, y) { return this.get(x, y) >= Unburned }

  isBurnedableStatus (status) { return status >= Unburned }

  // Returns TRUE if point [x, y] is Burned
  isBurned (x, y) { return this.get(x, y) > Unburned }

  isBurnedStatus (status) { return status > Unburned }

  // Returns TRUE if point [x, y] is Unburnable
  isUnburnable (x, y) { return this.get(x, y) < Unburned }

  isUnburnableStatus (status) { return status < Unburned }

  // Returns TRUE if point [x, y] is Unburned
  isUnburned (x, y) { return this.get(x, y) === Unburned }

  isUnburnedStatus (status) { return status === Unburned }

  mayTraverse (intoCol, intoRow) {
    // Translate the GridWalker col, row to this FireGrid's col, row
    const col = this._ignCol - this._ellipse.ignCol() + intoCol
    const row = this._ignRow - this._ellipse.ignRow() + intoRow
    // If point is out-of-bounds, deny permission
    if (!this.inbounds(col, row)) return false
    // If point is unburnable, deny permission
    if (this.isUnburnable(col, row)) return false
    // If point is Unburned, update it to the current burning period
    if (this.isUnburned(col, row)) {
      // console.log(`Updating ${col}, ${row} from ${this.status(col, row)} to ${this.periodNumber()}`)
      this.setColRow(col, row, this.periodNumber())
    }
    // Give GridWalker permission to traverse this point
    return true
  }

  periodBegins () { return this._period._begins }

  periodContains (t) { return t >= this.periodBegins() && t < this.periodEnds() }

  periodDuration () { return this.periodEnds() - this.periodBegins() }

  periodEnds () { return this._period._ends }

  periodMidpoint () { return this.periodBegins() + this.periodDuration() / 2 }

  periodNumber () { return this._period._number }

  periodStats () {
    const n = {
      period: this.periodNumber(),
      begins: this.periodBegins(),
      ends: this.periodEnds(),
      current: 0, // points burned during this period
      previous: 0, // points burned during a previous period
      unburned: 0, // unburned points
      unburnable: 0, // unburnable points
      ignited: this._ignSet.size // number of fire front points
    }
    console.log(this._ignSet)
    this.eachDatum((x, y, status) => {
      if (this.isUnburnedStatus(status)) n.unburned++
      else if (this.isUnburnableStatus(status)) n.unburnable++
      else if (status < this.periodBegins()) n.previous++
      else if (status <= this.periodEnds()) n.current++
      else n.unburned++ // ignites AFTER this time period
    })
    return n
  }

  periodUpdate (duration) {
    const prevEnd = this._period._ends
    this._period._ends = this._period._begins + duration
    this._period._begins = prevEnd
    this._period._number++
    return this
  }

  reset () {
    this.fill(Unburned)
    this._period = { _begins: 0, _ends: 0, _number: 0 }
    this._ignSet = new Set()
    return this
  }

  // Sets all [x, y] in the array to *Unburnable* (or some other *status*) and returns *this*
  setUnburnablePoints (pairs, status = Unburnable) {
    pairs.forEach(([x, y]) => { this.set(x, y, status) })
    return this
  }

  // Sets vertical column of north-south points to *Unburnable* (or some other *status*) and returns *this*
  setUnburnableCol (x, fromY, thruY, status = Unburnable) {
    this.setCol(x, fromY, thruY, status)
    return this
  }

  // Sets a rectangular area of points to Unburnable (or some other *status*) and returns *this*
  setUnburnableRect (fromX, fromY, thruX, thruY, status = Unburnable) {
    this.setRect(fromX, fromY, thruX, thruY, status)
    return this
  }

  // Sets horizontal row of west-east points to *Unburnable* (or some other *status*) and returns *this*
  setUnburnableRow (y, fromX, thruX, status = Unburnable) {
    this.setRow(y, fromX, thruX, status)
    return this
  }

  // Returns an Unburnable status (<0), an Unburned status (0), or the period when ignited (>0)
  status (x, y) { return this.get(x, y) }

  toString (title = '') {
    let str = `\n${title}\n     `
    for (let col = 0; col < this.cols(); col += 10) { str += `${(col / 10).toFixed(0).padEnd(10)}` }
    str += '\n     '
    for (let col = 0; col < this.cols(); col += 10) { str += '0123456789' }
    str += '\n'
    this.eachRow(y => {
      str += y.toFixed(0).padStart(4) + ' '
      this.eachCol(x => {
        const status = this.get(x, y)
        if (this.isUnburnableStatus(status)) str += 'X'
        else if (this.isUnburnedStatus(status)) str += '-'
        else str += status.toFixed(0)
      })
      str += '\n'
    })
    return str
  }
}
