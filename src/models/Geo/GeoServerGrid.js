import { GeoServer } from './GeoServer.js'

export class GeoServerGrid extends GeoServer {
  constructor (geoBounds, defaultValue = 0, guard = true) {
    super(geoBounds, defaultValue)
    this._grid = new Array(this.bounds().cols() * this.bounds().rows()).fill(defaultValue)
    this._guard = guard
  }

  // -----------------------------------------------------------------------------
  // Required GeoServer method reimplementations
  // -----------------------------------------------------------------------------

  // Returns the data of the grid cell containing world [x, y] coordinate
  get (x, y) { return this._grid[this.idx(this.xCol(x), this.yRow(y))] }

  // Sets the value of the grid cell containing world [x, y] coordinate
  set (x, y, value) {
    this._grid[this.idx(this.xCol(x), this.yRow(y))] = value
    return this
  }

  // -----------------------------------------------------------------------------
  // Data Accessors - only these methods are allowed to directly access properties
  // -----------------------------------------------------------------------------

  // Returns reference to the data array
  data () { return this._grid }

  // Returns TRUE if get() and set() are guarded
  guarded () { return this._guard }

  // -----------------------------------------------------------------------------
  // Convenience forwarders
  // -----------------------------------------------------------------------------

  // Returns total number of grid rows
  cols () { return this.bounds().cols() }

  east () { return this.bounds().east() }

  inbounds (x, y) { return this.bounds().inbounds(x, y) }

  north () { return this.bounds().north() }

  // Returns total number of grid rows
  rows () { return this.bounds().rows() }

  south () { return this.bounds().south() }

  west () { return this.bounds().west() }

  xSpacing () { return this.bounds().xSpacing() }

  ySpacing () { return this.bounds().ySpacing() }

  // -----------------------------------------------------------------------------
  // Data Getters - these methods must use data accessor above
  // -----------------------------------------------------------------------------

  // Returns total number of grid cells
  cells () { return this.cols() * this.rows() }

  // Returns grid column base-0 offset of a valid cell index 'idx'
  colOfIdx (idx) { return Math.floor(idx % this.cols()) }

  // Fills the Grid with 'value' and returns *this*
  fill (value) {
    this._grid.fill(value)
    return this
  }

  // Throws an Error if x-coordinate is outside bounds
  guardX (x) {
    if (!this.bounds().xInbounds(x)) {
      throw new Error(`GeoServerGrid x-coordinate ${x} is out-of-bounds ${this.bounds().west()} - ${this.bounds().east()}`)
    }
  }

  // Throws an Error if y-coordinate is outside bounds
  guardY (y) {
    if (!this.bounds().yInbounds(y)) {
      throw new Error(`GeoServerGrid y-coordinate ${y} is out-of-bounds ${this.bounds().south()} - ${this.bounds().north()}`)
    }
  }

  // Returns grid array index of cell at [col, row]
  idx (col, row) { return col + row * this.cols() }

  // Returns grid row base-0 offset of a valid cell index 'idx'
  rowOfIdx (idx) { return Math.floor(idx / this.cols()) }

  // Returns the col index of world x-coordinate (idx 0 is the western-most col)
  xCol (x) {
    if (this.guarded()) this.guardX(x)
    return this.bounds().xInterval(x)
  }

  // Returns the grid row index of world y-coordinate (idx 0 is the northern-most row)
  yRow (y) {
    if (this.guarded()) this.guardY(y)
    return this.bounds().yInterval(y)
  }
}
