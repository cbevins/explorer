export class TwoBit {
  constructor (cols, rows) {
    this._cols = cols
    this._rows = rows
    this._bit = new Uint32Array(Math.ceil(cols * rows / 32) + 1)
  }

  // Clear the bit at col, row to FALSE
  clear (col, row) {
    const i = col + row * this._cols
    const bigIndex = Math.floor(i / 32)
    const smallIndex = i % 16
    this._bit[bigIndex] = this._bit[bigIndex] & ~(2 << smallIndex)
  }

  // Return the value of the bit at col, row as TRUE | FALSE
  get (col, row) {
    const i = col + row * this._cols
    const bigIndex = Math.floor(i / 32)
    const smallIndex = i % 16
    const value = this._bit[bigIndex] & (2 << smallIndex) // & sets each bit to 1 if both bits are 1
    return value
  }

  // Set the bit at col, row to TRUE
  set (col, row) {
    const i = col + row * this._cols
    const bigIndex = Math.floor(i / 32)
    const smallIndex = i % 16
    this._bit[bigIndex] = this._bit[bigIndex] | (2 << smallIndex)
  }
}
