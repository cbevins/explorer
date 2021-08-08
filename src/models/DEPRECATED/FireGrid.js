import { Grid } from './Grid.js'
import { GridWalker } from './GridWalker.js'

// MOCK
export class MockFireEllipse extends GridWalker {
  constructor (cols, rows, fireGrid) {
    super(cols, rows)
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

export class FireGrid extends Grid {
  constructor (cols, rows) {
    super(cols, rows, Unburned)
    this._ellipse = null // Ignition ellipse GridWalker
    this._ignSet = new Set() // Set of ignition cell [cpl, row] arrays to start each burning period
    this._ignCol = 0 // current ignition cell col
    this._ignRow = 0 // current ignition cell row
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

  // Returns an array of the current fire front cells
  // NOTE: for now, just a single ignition point at grid center
  getIgnCells () {
    const cells = new Set()
    const n = this.cells()
    for (let idx = 0; idx < n; idx++) {
      const [c, r] = this.colRow(idx)
      if (this.isBurned(c, r)) {
        if (this.inbounds(c, r + 1) && this.isUnburned(c, r + 1)) cells.add([c, r + 1])
        if (this.inbounds(c, r - 1) && this.isUnburned(c, r - 1)) cells.add([c, r - 1])
        if (this.inbounds(c + 1, r) && this.isUnburned(c + 1, r)) cells.add([c + 1, r])
        if (this.inbounds(c - 1, r) && this.isUnburned(c - 1, r)) cells.add([c - 1, r])
      }
    }
    return cells
  }

  incrementPeriod () { this._period++ }

  // Returns TRUE if col, row is Unburned or Burned
  isBurnable (col, row) { return this.getColRow(col, row) >= Unburned }

  // Returns TRUE if col, row is Burned
  isBurned (col, row) { return this.getColRow(col, row) > Unburned }

  // Returns TRUE if col, row is Unburnable
  isUnburnable (col, row) { return this.getColRow(col, row) < Unburned }

  // Returns TRUE if col, row is Unburned
  isUnburned (col, row) { return this.getColRow(col, row) === Unburned }

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

  // Sets all cells at 'col' from 'rowFirst' through 'rowLast' inclusive
  setUnburnableCol (col, rowFirst, rowLast, status = Unburnable) {
    for (let row = rowFirst; row <= rowLast; row++) { this.setColRow(col, row, status) }
    return this
  }

  setUnburnableRect (colFirst, rowFirst, colLast, rowLast, status = Unburnable) {
    for (let row = rowFirst; row <= rowLast; row++) {
      for (let col = colFirst; col <= colLast; col++) {
        this.setColRow(col, row, status)
      }
    }
    return this
  }

  // Sets all cells at 'row' from 'colFirst' through 'colLast' inclusive, to Unburnable
  setUnburnableRow (row, colFirst, colLast, status = Unburnable) {
    for (let col = colFirst; col <= colLast; col++) { this.setColRow(col, row, status) }
    return this
  }

  // Returns an Unburnable status (<0), an Unburned status (0), or the period when ignited (>0)
  status (col, row) { return this.getColRow(col, row) }

  // Increments the burning period and sets the [col, row] to it
  // The cell MUST BE Unburned!!
  // The burning period MUST BE > 0, or it just gets set to Unburned!
  strike (col, row) {
    if (this.isUnburned(col, row)) {
      this.setColRow(col, row, this._period)
    }
    return this
  }

  toString (title = '') {
    let str = `\n${title}\n     `
    for (let col = 0; col < this.cols(); col += 10) { str += `${(col / 10).toFixed(0).padEnd(10)}` }
    str += '\n     '
    for (let col = 0; col < this.cols(); col += 10) { str += '0123456789' }
    str += '\n'
    for (let row = 0; row < this.rows(); row++) {
      str += row.toFixed(0).padStart(4) + ' '
      for (let col = 0; col < this.cols(); col++) {
        const status = this.getColRow(col, row)
        if (status < 0) str += 'X'
        else if (status === 0) str += '-'
        else str += status.toFixed(0)
      }
      str += '\n'
    }
    return str
  }
}
