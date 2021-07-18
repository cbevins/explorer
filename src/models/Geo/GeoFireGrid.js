import { FireStatus } from './FireStatus.js'
import { GeoBounds } from './GeoBounds.js'
import { GeoCoord } from './GeoCoord.js'
import { GeoServerGrid } from './GeoServerGrid.js'
import { GeoTime } from './GeoTime.js'
import { IgnitionGridProvider } from './IgnitionGridProvider.js'
import { Period } from './Period.js'

export class GeoFireGrid extends GeoServerGrid {
  constructor (west, north, east, south, xspacing, yspacing, fireInputProvider) {
    const bounds = new GeoBounds(west, north, east, south, xspacing, yspacing)
    super(bounds, FireStatus.Unburned)
    this._fireInputProvider = fireInputProvider
    this._ignitionGridProvider = new IgnitionGridProvider()
    this._ignSet = new Set() // Set of ignition GeoCoords to start each burning period
    this._ign = new GeoCoord(0, 0) // current ignition point [x, y]
    // NOTE that *begins* IS WITHIN the period, while *ends* is NOT WITHIN the period
    this._period = new Period()
  }

  // Burns points around the current fire front for a duration period.
  // Duration period should be relatively brief (on the order of minutes)
  // as constant spatial and temporal burning conditions are assumed from each ignition pt
  // (but, of course, can vary between ignition points).
  burn (duration) {
    // start a new burning period
    this.period().update(duration)
    // Locate all burned/burning points adjacent to burnable-unburned points
    this._ignSet = this.ignitionPointsAt(this.period().begins())
    console.log('Burn', this.period(), `has ${this._ignSet.size} ignition points`)
    // expand the fire from each ignition point via Huygen's Principle
    this._ignSet.forEach(ignPt => {
      console.log(`Ignition Point [${ignPt.x()}, ${ignPt.y()}] was ignited at time ${ignPt.time()}`)
      // Get fire behavior inputs at this ignition point and time
      const fireInput = this._fireInputProvider.getFireInput(
        ignPt.x(), ignPt.y(), this.period().begins(), duration)
      // Get an IgnitionGrid for these fire behavior conditions
      const ignGrid = this._ignitionGridProvider.getIgnitionGrid(this, fireInput)
      // Overlay the ignition grid on this ignition point,
      // and flood fill neighboring point ignition times accounting for unburnables
      ignGrid.walk(ignPt.x(), ignPt.y(), ignPt.time(), this.period())
    })
  }

  // Ignites the point [x, y] at time t, IFF it is Unburned
  // \TODO Add this to a stack of ignition points
  igniteAt (x, y, t) {
    if (this.isUnburnedAt(x, y, t)) this.set(x, y, t)
    return this
  }

  // Returns an Set of IgnitionPoints
  // that are adjacent to Unburned but Burnable points at time *t*
  ignitionPointsAt (t) {
    const points = new Set()
    const dx = this.xSpacing()
    const dy = this.ySpacing()
    this.eachDatum((x, y, status) => {
      if (FireStatus.isBurnedAt(status, t)) {
        if ((this.inbounds(x, y + dy) && this.isUnburnedAt(x, y + dy, t)) ||
            (this.inbounds(x, y - dy) && this.isUnburnedAt(x, y - dy, t)) ||
            (this.inbounds(x + dx, y) && this.isUnburnedAt(x + dx, y, t)) ||
            (this.inbounds(x - dx, y) && this.isUnburnedAt(x - dx, y, t))) {
          points.add(new GeoTime(x, y, status))
        }
      }
    })
    return points
  }

  // Returns TRUE if point [x, y] is Unburned or Burned
  isBurnable (x, y) { return FireStatus.isBurnable(this.get(x, y)) }

  // Returns TRUE if point [x, y] is Burned at time *t*
  isBurnedAt (x, y, t) { return FireStatus.isBurnedAt(this.get(x, y), t) }

  // Returns TRUE if point [x, y] is Unburnable
  isUnburnable (x, y) { return FireStatus.isUnburnable(this.get(x, y)) }

  // Returns TRUE if point [x, y] is Unburned at time *t*
  isUnburnedAt (x, y, t) { return FireStatus.isUnburnedAt(this.get(x, y), t) }

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
    let str = `\n${title} at time ${this.period().ends()}\n     `
    for (let col = 0; col < this.cols(); col += 10) { str += `${(col / 10).toFixed(0).padEnd(10)}` }
    str += '\n     '
    for (let col = 0; col < this.cols(); col += 10) { str += '0123456789' }
    str += '\n'
    this.eachRow(y => {
      str += y.toFixed(0).padStart(4) + ' '
      this.eachCol(x => {
        const status = this.get(x, y)
        if (FireStatus.isUnburnable(status)) str += 'X'
        else if (FireStatus.isUnburnedAt(status, this.period().ends())) str += '-'
        else str += '*'
      })
      str += '\n'
    })
    return str
  }
}
