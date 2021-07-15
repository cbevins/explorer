/**
 * The convention used for argument order for points is [x, y], i.e.,
 *  - [easting, northing]
 *  - [longitude, latitude]
 *
 * The convention use for argument order for rectangles is
 *  - upper-left point, lower right point, i.e.,
 *  - west, north, east, south
 *  - left, top, right, bottom
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

  // -----------------------------------------------------------------------------
  // Data Getters - these methods must use data accessor above
  // -----------------------------------------------------------------------------

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
}
