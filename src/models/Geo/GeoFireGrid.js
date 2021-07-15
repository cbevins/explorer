import { GeoBounds } from './GeoBounds.js'
import { GeoCoord } from './GeoCoord.js'
import { GeoServerGrid } from './GeoServerGrid.js'
import { createFireEllipse } from './FireEllipse.js'
import { FireStatus } from './FireStatus.js'
import { Period } from './Period.js'

export class GeoFireGrid extends GeoServerGrid {
  constructor (west, north, east, south, xspacing, yspacing) {
    const bounds = new GeoBounds(west, north, east, south, xspacing, yspacing)
    super(bounds, FireStatus.Unburned)
    this._ignSet = new Set() // Set of ignition GeoCoords to start each burning period
    this._ign = new GeoCoord(0, 0) // current ignition point [x, y]
    // NOTE that *begins* IS WITHIN the period, while *ends* is NOT WITHIN the period
    this._period = new Period()
  }

  // Determines fire front ignition points and burns them for the duration
  burn (duration) {
    this.period().update()
    const t = this.period().ends()
    this._ignSet = this.ignitionpointsAt(t)
    // console.log(`Period ${this.period().number()} has ${this._ignSet.size} ignition points`)
    this._ignSet.forEach(([col, row]) => {
      // Step 1 - get fire ellipse parameters for this point and time
      // const ellipse = this.fireProvider().get(x, y, t)
      const ellipse = createFireEllipse(10, 2, duration) // (headRos, lwr, duration)
      // Step 2 - overlay ellipse on ignition point
    })
  }

  // Ignites the point [x, y] at time t, IFF it is Unburned
  igniteAt (x, y, t) {
    if (this.isUnburnedAt(x, y, t)) this.set(x, y, t)
    return this
  }

  // Returns an Set of GeoCoords of Burned points
  // that are adjacent to Unburned Burnable points at time *t*
  ignitionPointsAt (t) {
    const coords = new Set()
    const dx = this.xSpacing()
    const dy = this.ySpacing()
    this.eachDatum((x, y, status) => {
      if (FireStatus.isBurnedAt(status, t)) {
        if ((this.inbounds(x, y + dy) && this.isUnburnedAt(x, y + dy, t)) ||
            (this.inbounds(x, y - dy) && this.isUnburnedAt(x, y - dy, t)) ||
            (this.inbounds(x + dx, y) && this.isUnburnedAt(x + dx, y, t)) ||
            (this.inbounds(x - dx, y) && this.isUnburnedAt(x - dx, y, t))) {
          coords.add(new GeoCoord(x, y))
        }
      }
    })
    return coords
  }

  // Returns TRUE if point [x, y] is Unburned or Burned
  isBurnable (x, y) { return FireStatus.isBurnable(this.get(x, y)) }

  // Returns TRUE if point [x, y] is Burned at time *t*
  isBurnedAt (x, y, t) { return FireStatus.isBurnedAt(this.get(x, y), t) }

  // Returns TRUE if point [x, y] is Unburnable
  isUnburnable (x, y) { return FireStatus.isUnburnable(this.get(x, y)) }

  // Returns TRUE if point [x, y] is Unburned at time *t*
  isUnburnedAt (x, y, t) { return FireStatus.isUnburnedAt(this.get(x, y), t) }

  mayTraverse (intoCol, intoRow) {
    // Translate the GridWalker col, row to this FireGrid's col, row
    const col = this._ignCol - this._ellipse.ignCol() + intoCol
    const row = this._ignRow - this._ellipse.ignRow() + intoRow
    // If point is out-of-bounds, deny permission
    if (!this.inbounds(col, row)) return false
    // If point is unburnable, deny permission
    if (this.isUnburnable(col, row)) return false
    // If point is Unburned, update it to the current burning period
    if (this.isUnburnedAt(col, row, this.period().begins())) {
      // console.log(`Updating ${col}, ${row} from ${this.status(col, row)} to ${this.period().number()}`)
      this.setColRow(col, row, this.period().number())
    }
    // Give GridWalker permission to traverse this point
    return true
  }

  // Returns current burning Period
  period () { return this._period }

  // Returns point status stats for the current burning period
  periodStats () {
    const n = {
      period: this.period().number(),
      begins: this.period().begins(),
      ends: this.period().ends(),
      current: 0, // points burned during this period
      previous: 0, // points burned during a previous period
      unburned: 0, // unburned points
      unburnable: 0, // unburnable points
      ignited: this._ignSet.size, // number of fire front points
      other: 0
    }
    this.eachDatum((x, y, status) => {
      if (FireStatus.isUnburnable(status)) n.unburnable++
      else if (FireStatus.isUnburnedAt(status, this.period().ends())) n.unburned++
      else if (status < this.period().begins()) n.previous++
      else if (status <= this.period().ends()) n.current++
      else n.other++ // ignites AFTER this time period
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
    this.fill(FireStatus.Unburned)
    this._period = { _begins: 0, _ends: 0, _number: 0 }
    this._ignSet = new Set()
    return this
  }

  // Sets all [x, y] in the array to *Unburnable* (or some other *status*) and returns *this*
  setUnburnablePoints (pairs, status) {
    if (status === undefined) status = FireStatus.Unburnable
    pairs.forEach(([x, y]) => { this.set(x, y, status) })
    return this
  }

  // Sets vertical column of north-south points to *Unburnable* (or some other *status*) and returns *this*
  setUnburnableCol (x, fromY, thruY, status) {
    if (status === undefined) status = FireStatus.Unburnable
    this.setCol(x, fromY, thruY, status)
    return this
  }

  // Sets a rectangular area of points to Unburnable (or some other *status*) and returns *this*
  setUnburnableRect (fromX, fromY, thruX, thruY, status) {
    if (status === undefined) status = FireStatus.Unburnable
    this.setRect(fromX, fromY, thruX, thruY, status)
    return this
  }

  // Sets horizontal row of west-east points to *Unburnable* (or some other *status*) and returns *this*
  setUnburnableRow (y, fromX, thruX, status) {
    if (status === undefined) status = FireStatus.Unburnable
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
