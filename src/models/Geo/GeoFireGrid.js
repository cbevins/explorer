import { GeoBounds } from './GeoBounds.js'
import { GeoCoord } from './GeoCoord.js'
import { GeoServerGrid } from './GeoServerGrid.js'

// MOCK
export class MockFireEllipse {
  constructor (cols, rows, fireGrid) {
    // super(cols, rows)
    this._fireGrid = fireGrid
    this._ignCol = Math.round(cols / 2) - 1
    this._ignRow = Math.round(rows / 2) - 1
  }

  burn () { this.walk(this.ignCol(), this.ignRow(), this._fireGrid) }

  ignCol () { return this._ignCol }

  ignRow () { return this._ignRow }
}

// Cell status enums
export const ControlLine = -3
export const Unburnable = -2
export const OutOfBounds = -1
export const Unburned = 0

export class GeoFireGrid extends GeoServerGrid {
  constructor (west, north, east, south, xspacing, yspacing) {
    const bounds = new GeoBounds(west, north, east, south, xspacing, yspacing)
    super(bounds, Unburned)
    this._ignSet = new Set() // Set of ignition cell GeoCoords to start each burning period
    this._ign = new GeoCoord(0, 0) // current ignition cell [x, y]
    this._period = 0 // current burning period
  }

  // Determines fire front ignition cells and burns them for 1 time period
  burn () {
    this._period++
    this._ignSet = this.getIgnCells()
    // console.log(`Period ${this._period} has ${this._ignSet.size} ignition cells`)
    this._ignSet.forEach(([col, row]) => {
      this._ignCol = col
      this._ignRow = row
      this.setColRow(col, row, this._period)
      // console.log(`Igniting ${col}, ${row} at period ${this._period}`)
      // Get the fire behavior
      // const fire = this._fireModel.run(col, row)
      // this._ellipse = new FireEllipse(fire.length, fire.width, fire.heading)
      this._ellipse = new MockFireEllipse(11, 11, this)
      // Burn from this fire front cell using this ellipse template
      this._ellipse.burn()
    })
  }

  count () {
    const n = {
      period: this._period,
      current: 0,
      previous: 0,
      unburned: 0,
      unburnable: 0,
      ignited: this._ignSet.size
    }
    this.data().forEach(status => {
      if (status === 0) n.unburned++
      else if (status < 0) n.unburnable++
      else if (status === this._period) n.current++
      else n.previous++
    })
    return n
  }

  // Returns an Set of GeoCoords of Burned points that are adjacent to Unburned Burnable points
  getIgnCells () {
    const cells = new Set()
    const dx = this.xSpacing()
    const dy = this.ySpacing()
    for (let y = this.north(); y <= this.south(); y -= dy) {
      for (let x = this.west(); x <= this.east(); x += dx) {
        if (this.isBurned(x, y)) {
          if ((this.inbounds(x, y + dy) && this.isUnburned(x, y + dy)) ||
            (this.inbounds(x, y - dy) && this.isUnburned(x, y - dy)) ||
            (this.inbounds(x + dx, y) && this.isUnburned(x + dx, y)) ||
            (this.inbounds(x - dx, y) && this.isUnburned(x - dx, y))) {
            cells.add(new GeoCoord(x, y))
          }
        }
      }
    }
    return cells
  }

  incrementPeriod () { this._period++ }

  // Returns TRUE if point [x, y] is Unburned or Burned
  isBurnable (x, y) { return this.get(x, y) >= Unburned }

  // Returns TRUE if point [x, y] is Burned
  isBurned (x, y) { return this.get(x, y) > Unburned }

  // Returns TRUE if point [x, y] is Unburnable
  isUnburnable (x, y) { return this.get(x, y) < Unburned }

  // Returns TRUE if point [x, y] is Unburned
  isUnburned (x, y) { return this.get(x, y) === Unburned }

  mayTraverse (intoCol, intoRow) {
    // Translate the GridWalker col, row to this FireGrid's col, row
    const col = this._ignCol - this._ellipse.ignCol() + intoCol
    const row = this._ignRow - this._ellipse.ignRow() + intoRow
    // If FireGrid cell is out-of-bounds, deny permission
    if (!this.inbounds(col, row)) return false
    // If FireGrid cell is unburnable, deny permission
    if (this.isUnburnable(col, row)) return false
    // If FireGrid cell is Unburned, update it to the current burning period
    if (this.isUnburned(col, row)) {
      // console.log(`Updating ${col}, ${row} from ${this.status(col, row)} to ${this._period}`)
      this.setColRow(col, row, this._period)
    }
    // Give GridWalker permission to enter this cell
    return true
  }

  period () { return this._period }

  reset () {
    this.fill(Unburned)
    this._ignSet = new Set()
    this._period = 0
    return this
  }

  // Sets all [col, row] in the array to Unburnable
  setUnburnableCells (pairs, status = Unburnable) {
    pairs.forEach(([col, row]) => { this.setColRow(col, row, status) })
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

  // Sets the point [x, y] to the current burning period, IFF it is Unburned
  // Note: the burning period MUST BE > 0, or it just gets set to 0, which is Unburned!
  strike (x, y) {
    if (this.isUnburned(x, y)) {
      this.set(x, y, this._period)
    }
    return this
  }

  toString (title = '') {
    let str = `\n${title}\n     `
    for (let col = 0; col < this.cols(); col += 10) { str += `${(col / 10).toFixed(0).padEnd(10)}` }
    str += '\n     '
    for (let col = 0; col < this.cols(); col += 10) { str += '0123456789' }
    str += '\n'
    for (let y = this.north(); y >= this.south(); y -= this.ySpacing()) {
      str += y.toFixed(0).padStart(4) + ' '
      for (let x = this.west(); x <= this.east(); x += this.xSpacing()) {
        const status = this.get(x, y)
        if (status < 0) str += 'X'
        else if (status === 0) str += '-'
        else str += status.toFixed(0)
      }
      str += '\n'
    }
    return str
  }
}
