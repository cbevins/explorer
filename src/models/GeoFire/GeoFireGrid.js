import { FireStatus } from './FireStatus.js'
import { GeoBounds, GeoServerGrid, GeoTime } from '../Geo'
import { IgnitionGridProvider } from './IgnitionGridProvider.js'
import { Period } from './Period.js'

export class GeoFireGrid extends GeoServerGrid {
  constructor (west, north, east, south, xspacing, yspacing, fireInputProvider) {
    const bounds = new GeoBounds(west, north, east, south, xspacing, yspacing)
    super(bounds, FireStatus.Unburned)
    // The following are set at construction time
    this._fireInput = {} // current ignition point's fire input parameters
    this._fireInputProvider = fireInputProvider
    this._ignitionGridProvider = new IgnitionGridProvider()
    this._ignGrid = null // current ignition point's IgnitionGrid

    // The following are updated at start of each burnForPeriod()
    // NOTE that *begins* IS WITHIN the period, while *ends* is NOT WITHIN the period
    this._period = new Period()
    this._perim = {
      points: new Set(), // Set of perim pt GeoCoords that serve as ignition pts at start each burning period
      faces: [0, 0, 0, 0, 0]
    }
    this._points = { burned: 0, unburnable: 0, unburned: 0 }
  }

  /**
   * Burns points around the current fire front for a duration period.
   * Duration period should be relatively brief (on the order of minutes)
   * as constant spatial and temporal burning conditions are assumed from each ignition pt
   * (but, of course, can vary between ignition points).
   *
   * @param {number} duration Burning period duration (min)
   * @returns {bool} TRUE if there was at least 1 ignition point at start of the period,
   * FALSE to inform caller that there are no more ignition points.
   */
  burnForPeriod (duration) {
    // Update the current burning period
    this.period().update(duration)

    // Locate all burned/burning points adjacent to burnable-unburned points
    ;[this._points, this._perim] = this.gridStatusAt(this.period().begins())
    // let str = `Period ${this.period().number()} (${this.period().begins()} - ${this.period().ends()} min)`
    // str += ` ${this._perim.points.size} ign pts, ${this._burnedPts} burned pts`

    // Return FALSE if there are no ignition points
    if (!this._perim.points.size) return false

    // Expand the fire from each ignition point via Huygen's Principle
    // eslint-disable-next-line no-unused-vars
    let ignited = 0
    let maxTraversalDepth = 0
    this._perim.points.forEach(ignPt => {
      // str += `    Ignition Point [${ignPt.x()}, ${ignPt.y()}], ignited at time ${ignPt.time()}`

      // Get fire behavior inputs at this ignition point and time
      this._fireInput = this._fireInputProvider.getFireInput(
        ignPt.x(), ignPt.y(), this.period().begins(), this.period().duration())

      // Get an IgnitionGrid distance-time overlay for these fire behavior conditions
      this._ignGrid = this._ignitionGridProvider.getIgnitionGrid(this, this._fireInput)

      // Overlay the IgnitionGrid on this ignition point,
      // and flood fill neighboring point ignition times accounting for unburnables
      this._ignGrid.walk(ignPt.x(), ignPt.y(), ignPt.time(), this.period())
      ignited += this._ignGrid._walk.ignited
      maxTraversalDepth = Math.max(maxTraversalDepth, this._ignGrid.maxTraversalDepth())
    })
    return true
  }

  // Returns reference to the FireEllipse used by the IgnitionGrid for the current ignition point
  fireEllipse () { return this._ignGrid._ellipse }

  // Returns reference to the fire input object used by IgnitionGrid for the current ignition point
  fireInput () { return this._fireInput }

  // Determines the Set of perimeter points and
  // the distribution of burned points with 0, 1, 2, 3, or 4 unburned neighbors
  // and the number of unburnable, unburned, and burned cells
  // May be used to estimate a fire area and perimeter at time *t* (or end of current burning period)
  gridStatusAt (t) {
    const perim = { points: new Set(), faces: [0, 0, 0, 0, 0] }
    const points = { burned: 0, unburnable: 0, unburned: 0 }
    const dx = this.xSpacing()
    const dy = this.ySpacing()
    this.eachDatum((x, y, status) => {
      if (FireStatus.isUnburnable(status)) {
        points.unburnable++
      } else if (FireStatus.isBurnedAt(status, t)) {
        points.burned++
        let faces = 0
        if (this.inbounds(x, y + dy) && this.isUnburnedAt(x, y + dy, t)) faces++
        if (this.inbounds(x, y - dy) && this.isUnburnedAt(x, y - dy, t)) faces++
        if (this.inbounds(x + dx, y) && this.isUnburnedAt(x + dx, y, t)) faces++
        if (this.inbounds(x - dx, y) && this.isUnburnedAt(x - dx, y, t)) faces++
        perim.faces[faces]++
        if (faces) perim.points.add(new GeoTime(x, y, status))
      } else {
        points.unburned++
      }
    })
    return [points, perim]
  }

  /**
   * Ignites the point [x, y] at time *t*, IFF it is Unburned
   *
   * @param {number} x Ignition point x-coordinate
   * @param {number} y Ignition point y-coordinate
   * @param {number} t Time of ignition
   * @returns Reference to *this* GeoFireGrid
   */
  igniteAt (x, y, t) {
    if (this.isUnburnedAt(x, y, t)) this.set(x, y, t)
    return this
  }

  // Returns reference to the IgnitionGrid for the current ignition point
  ignitionGrid () { return this._ignGrid }

  // Returns the *number* of ignition points for the current period
  ignitionPoints () { return this._perim.points.size }

  // Returns an Set of *IgnitionPoints*, ignited or previously burned points
  // that are adjacent to Unburned but Burnable points at time *t*
  ignitionPointsAt (t) {
    const [, perim] = this.gridStatusAt(t)
    return perim.points
  }

  // Returns TRUE if point [x, y] is Unburned or Burned
  isBurnable (x, y) { return FireStatus.isBurnable(this.get(x, y)) }

  // Returns TRUE if point [x, y] is Burned at time *t*
  isBurnedAt (x, y, t) { return FireStatus.isBurnedAt(this.get(x, y), t) }

  // Returns TRUE if point [x, y] is Unburnable
  isUnburnable (x, y) { return FireStatus.isUnburnable(this.get(x, y)) }

  // Returns TRUE if point [x, y] is Unburned at time *t*
  isUnburnedAt (x, y, t) { return FireStatus.isUnburnedAt(this.get(x, y), t) }

  perimFaces () { return this._perim.faces }

  // Returns current burning Period
  period () { return this._period }

  // Returns point status stats for the current burning period
  periodStats () {
    const stats = {
      period: this.period().number(),
      begins: this.period().begins(),
      ends: this.period().ends(),
      current: 0, // points burned during this period
      previous: 0, // points burned during a previous period
      unburned: 0, // unburned points
      unburnable: 0, // unburnable points
      ignited: this._perim.points.size, // number of fire front points
      other: 0
    }
    this.eachDatum((x, y, status) => {
      if (FireStatus.isUnburnable(status)) stats.unburnable++
      else if (FireStatus.isUnburnedAt(status, this.period().ends())) stats.unburned++
      else if (status < this.period().begins()) stats.previous++
      else if (status <= this.period().ends()) stats.current++
      else stats.other++ // ignites AFTER this time period
    })
    return stats
  }

  reset () {
    this.fill(FireStatus.Unburned)
    this._burnedPts = 0
    this._fireInput = {} // current ignition point's fire input parameters
    this._period = new Period() // NOTE that *begins* IS WITHIN the period, while *ends* is NOT WITHIN the period
    this._ignGrid = null // current ignition point's IgnitionGrid
    this._perim = {
      points: new Set(), // Set of perim pt GeoCoords that serve as ignition pts at start each burning period
      faces: [0, 0, 0, 0, 0]
    }
    this._points = { burned: 0, unburnable: 0, unburned: 0 }
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
}
