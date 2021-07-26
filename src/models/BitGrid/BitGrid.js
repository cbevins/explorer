export class BitGrid {
  constructor (cols, rows) {
    this._cols = cols
    this._rows = rows
    this._bit = new Uint32Array(Math.ceil(cols * rows / 32))
  }

  // Clear the bit at col, row to FALSE
  clear (col, row) {
    const i = col + row * this._cols
    const bigIndex = Math.floor(i / 32)
    const smallIndex = i % 32
    this._bit[bigIndex] = this._bit[bigIndex] & ~(1 << smallIndex)
  }

  // Return the value of the bit at col, row as TRUE | FALSE
  get (col, row) {
    const i = col + row * this._cols
    const bigIndex = Math.floor(i / 32)
    const smallIndex = i % 32
    const value = this._bit[bigIndex] & (1 << smallIndex)
    // we convert to boolean to make sure the result is always 0 or 1,
    // instead of what is returned by the mask
    return value !== 0
  }

  // Set the bit at col, row to TRUE
  set (col, row) {
    const i = col + row * this._cols
    const bigIndex = Math.floor(i / 32)
    const smallIndex = i % 32
    this._bit[bigIndex] = this._bit[bigIndex] | (1 << smallIndex)
  }
}
