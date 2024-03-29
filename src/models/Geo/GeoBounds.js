/**
 * GeoBounds represents a rectangular geographic extent (bounding box)
 * with a fixed internal spacing between neighboring x-axis (west-to-east)
 * and y-axis (south-to-north) points.
 *
 * The convention used for argument order for points is [x, y], i.e.,
 *  - [easting, northing]
 *  - [longitude, latitude]
 *
 * The convention used for argument order for rectangles is
 *  - upper-left point, lower right point, i.e.,
 *    - west, north, east, south
 *    - left, top, right, bottom
 */
import { GeoCoord } from './GeoCoord.js'

export class GeoBounds {
  constructor (west, north, east, south, xSpacing = 1, ySpacing = 1) {
    this._nw = new GeoCoord(west, north)
    this._se = new GeoCoord(east, south)
    this._sp = new GeoCoord(xSpacing, ySpacing)
  }

  // -----------------------------------------------------------------------------
  // Data Accessors - only these methods are allowed to directly access properties
  // -----------------------------------------------------------------------------

  // Returns x coordinate of eastern edge
  east () { return this._se.x() }

  // Returns y coordinate of northern edge
  north () { return this._nw.y() }

  // Returns y coordinate of southern edge
  south () { return this._se.y() }

  // Returns distance between x snap points
  xSpacing () { return this._sp.x() }

  // Returns distance between y snap points
  ySpacing () { return this._sp.y() }

  // Returns x coordinate of western edge
  west () { return this._nw.x() }

  // Returns the most commonly accessed properties as an object
  props () {
    return {
      west: this.west(),
      north: this.north(),
      east: this.east(),
      south: this.south(),
      xSpacing: this.xSpacing(),
      ySpacing: this.ySpacing()
    }
  }

  // -----------------------------------------------------------------------------
  // Data Getters - these methods must use data accessor above
  // -----------------------------------------------------------------------------

  // Returns the index of the cell containing [x, y]
  cellIndex (x, y) { return this.xInterval(x) + this.yInterval(y) * this.cols() }

  // Returns number of cells within the GeoBounds
  cells () { return (this.cols() - 1) * (this.rows() - 1) }

  // Returns number of x-axis snap points
  cols () { return 1 + Math.ceil(this.width() / this.xSpacing()) }

  eastOf (x, y) { return new GeoCoord(x + this.xSpacing(), y) }
  westOf (x, y) { return new GeoCoord(x - this.xSpacing(), y) }
  northOf (x, y) { return new GeoCoord(x, y + this.ySpacing()) }
  southOf (x, y) { return new GeoCoord(x, y - this.ySpacing()) }

  // Returns height of the bounding box
  height () { return this.north() - this.south() }

  // Returns TRUE if [x,y] is within the Bounds
  inbounds (x, y) { return this.xInbounds(x) && this.yInbounds(y) }

  // Returns GeoCoord of northheast corner
  northEast () { return new GeoCoord(this.east(), this.north()) }

  // Returns GeoCoord of northwest corner
  northWest () { return new GeoCoord(this.west(), this.north()) }

  // Returns number of y-axis snap points
  rows () { return 1 + Math.ceil(this.height() / this.ySpacing()) }

  // Returns GeoCoord of closest exact xSpacing, ySpacing for x, y
  snap (x, y) { return new GeoCoord(this.snapX(x), this.snapY(y)) }

  // Returns closest exact xSpacing for x
  snapX (x) { return this.west() + this.xSpacing() * Math.round((x - this.west()) / this.xSpacing()) }

  // Returns closest exact ySpacing for x
  snapY (y) { return this.north() - this.ySpacing() * Math.round((this.north() - y) / this.ySpacing()) }

  // Returns GeoCoord of southeast corner
  southEast () { return new GeoCoord(this.east(), this.south()) }

  // Returns GeoCoord of southwest corner
  southWest () { return new GeoCoord(this.west(), this.south()) }

  // Returns width of the bounding box
  width () { return this.east() - this.west() }

  // Returns TRUE if x is within the western adn eastern bounds
  xInbounds (x) { return x >= this.west() && x <= this.east() }

  // Returns the x-spacing interval (base 0) containing (i.e., col index from west)
  xInterval (x) { return Math.floor((x - this.west()) / this.xSpacing()) }

  // Returns TRUE if y is within the northern and southern bounds
  yInbounds (y) { return y <= this.north() && y >= this.south() }

  // Returns the y-spacing interval (base 0) containing y (i.e., row index from north)
  yInterval (y) { return Math.floor((this.north() - y) / this.ySpacing()) }

  // Returns array of all x tics crossed when traversing from x0 to x1
  xCrossings (x0, x1) { return this.crossings(x0, x1, this.xSpacing()) }

  // Returns array of all y tics crossed when traversing from y0 to y1
  yCrossings (y0, y1) { return this.crossings(y0, y1, this.ySpacing()) }

  crossings (p0, p1, spacing) {
    const xings = []
    let first
    if (p0 < p1) { // traversing west-to-east OR south-to-north
    // if already ON the line, then it is NOT traversed
    // So if p=100 and spacing=10, first traversed first tic is 110
      first = spacing * (Math.floor(p0 / spacing) + 1) // first tic traversed to the east or north
      for (let p = first; p <= p1; p += spacing) { xings.push(p) }
    } else { // traversing east-to-west or north-to-south
    // If already ON the line, then it is NOT traversed
    // So if p=100 and spacing=10, first traversed tic is 90
      first = spacing * (Math.ceil(p0 / spacing) - 1) // first tic traversed to the west or south
      for (let p = first; p >= p1; p -= spacing) { xings.push(p) }
    }
    return xings
  }
}
