import { Grid } from './Grid.js'

// Cell status enums
export const ControlLine = -3
export const Unburnable = -2
export const OutOfBounds = -1
export const Unburned = 9999

export class FireGrid extends Grid {
  constructor (cols, rows) {
    super(cols, rows, Unburned)
    this._order = 0
  }

  init () {
    this._order = 0
    this.fill(Unburned)
    // \TODO Set Unburnable cells here
  }

  mayTraverse (walkerCol, walkerRow) {
    // Translate walker col, row to client col, row
    const col = walkerCol
    const row = walkerRow
    // Client col and row must be inbounds
    if (!this.inbounds(col, row)) return false
    // Client cell must be burnable
    const status = this.getColRow(col, row)
    if (status === Unburnable) return false
    // If this cell is unburned, store its burning period
    if (status === Unburned) this.setColRow(col, row, this._order++)
    // Give GridWalker permission to enter this cell
    return true
  }

  setUnburnable (pairs) {
    pairs.forEach(([col, row]) => {
      console.log(`Setting [${col},${row}] Unburnable`)
      this.setColRow(col, row, Unburnable)
    })
    return this
  }

  startIgnition (startCol, startRow, walker) {
    this.setColRow(startCol, startRow, this._order++)
    walker.walk(startCol, startRow, this)
  }
}
