/**
 * Basic grid data structure
 */
export class Grid {
  constructor (cols, rows, fillValue = null, guard = true) {
    this._cols = cols
    this._rows = rows
    this._cells = cols * rows
    this._guard = guard
    this._data = new Array(cols * rows)
    if (fillValue !== null) this._data.fill(fillValue)
  }

  // Returns total number of grid cells
  cells () { return this._cells }

  // Returns grid column base-0 offset of a valid cell index 'idx'
  // Throws Error if invalid 'idx'
  col (idx) {
    if (this._guard) this.guardIdx(idx)
    return Math.floor(idx % this._cols)
  }

  // Returns total number of grid rows
  cols () { return this._cols }

  // Returns [col, row] of cell at 'idx'
  // Throws Error if invalid 'idx'
  colRow (idx) {
    if (this._guard) this.guardIdx(idx)
    return [this.col(idx), this.row(idx)]
  }

  // Returns reference to the grid data array
  data () { return this._data }

  // Fills the Grid with 'value' and returns *this*
  fill (value) {
    this._data.fill(value)
    return this
  }

  // Returns data stored at [col, row]
  // Throws an Error if invalid 'col' or 'row'
  getColRow (col, row) { return this._data[this.idx(col, row)] }

  // Returns data stored at idx
  // Throws an Error if invalid 'idx'
  getCell (idx) {
    if (this._guard) this.guardIdx(idx)
    return this._data[idx]
  }

  // Throws an Error if 'col' is out-of-bounds
  guardCol (col) {
    if (col < 0 || col >= this._cols) {
      throw new Error(`Grid col ${col} is out-of-bound [0..${this._cols - 1}]`)
    }
  }

  // Throws an Error if 'idx' is out-of-bounds
  guardIdx (idx) {
    if (idx < 0 || idx >= this._cells) {
      throw new Error(`Grid index ${idx} is out-of-bound [0..${this._cells - 1}]`)
    }
  }

  // Throws an Error if 'row' is out-of-bounds
  guardRow (row) {
    if (row < 0 || row >= this._rows) {
      throw new Error(`Grid row ${row} is out-of-bound [0..${this._rows - 1}]`)
    }
  }

  // Returns index of cell at [col, row], or throws Error if invalid 'col' or 'row'
  idx (col, row) {
    if (this._guard) {
      this.guardCol(col)
      this.guardRow(row)
    }
    return col + row * this._cols
  }

  // Returns TRUE if both 'col' and 'row' are within the grid
  inbounds (col, row) { return col >= 0 && row >= 0 && col < this._cols && row < this._rows }

  // Returns grid row base-0 offset of a valid cell index 'idx'
  // Throws an Error if invalid 'idx'
  row (idx) {
    if (this._guard) this.guardIdx(idx)
    return Math.floor(idx / this._cols)
  }

  // Returns total number of grid rows
  rows () { return this._rows }

  // Sets data at [col, row] to 'value' and returns *this*
  // Throws an Error if invalid 'col' or 'row'
  setColRow (col, row, value) {
    this._data[this.idx(col, row)] = value
    return this
  }

  // Sets data at cell 'idx' and returns *this*
  // Throws an Error if invalid 'idx'
  setCell (idx, value) {
    if (this._guard) this.guardIdx(idx)
    this._data[idx] = value
    return this
  }

  setGuard (toggle) { this._guard = toggle }

  toString (title = '', width = 4) {
    let str = `\n${title}\n   | `
    let dash = '---|'
    for (let col = 0; col < this.cols(); col++) {
      str += col.toFixed(0).padStart(width) + ' | '
      dash += '------|'
    }
    str += '\n' + dash + '\n'
    for (let row = 0; row < this.rows(); row++) {
      str += row.toFixed(0).padStart(2) + ' | '
      for (let col = 0; col < this.cols(); col++) {
        str += this.getColRow(col, row).toFixed(0).padStart(width) + ' | '
      }
      str += '\n'
    }
    return str
  }
}
