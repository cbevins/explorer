/**
 * GeoServer is an abstract class whose derived classes must implement their own
 * get() and set() methods.
 *
 * GeoServer provides convenience methods for getting and setting rows, columns,
 * and rectangles of points snapped to a GeoBounds.
 */
export class GeoServer {
  constructor (geoBounds, defaultValue = 0) {
    this._defaultValue = defaultValue
    this._geoBounds = geoBounds
  }

  // ---------------------------------------------------------------------------
  // Only the the following accessor methods should directly access this properties.
  // ---------------------------------------------------------------------------

  bounds () { return this._geoBounds }

  defaultValue () { return this._defaultValue }

  // ---------------------------------------------------------------------------
  // The following methods MUST be reimplemented by dervied classes
  // ---------------------------------------------------------------------------

  get (x, y) { throw new Error('GeoServer.get(x, y) MUST be re-implemented)') }

  // Must set [x, y] to *value* and return *this*
  set (x, y, value) { throw new Error('GeoServer.set(x, y, value) MUST be re-implemented)') }

  // ---------------------------------------------------------------------------
  // The following methods MAY be reimplemented by dervied classes
  // (primarily to improve performance for its storage structure)
  // ---------------------------------------------------------------------------

  // Returns x-coordinate located n spacings to the east of *x*
  eastOf (x, n = 1) { return x + n + this.bounds().xSpacing() }

  // Returns x-coordinate located n spacings to the west of *x*
  westOf (x, n = 1) { return x - n * this.bounds().xSpacing() }

  // Returns y-coordinate located n spacings to the north of *y*
  northOf (y, n = 1) { return y + n * this.bounds().ySpacing() }

  // Returns y-coordinate located n spacings to the south of *y*
  southOf (y, n = 1) { return y - n * this.bounds().ySpacing() }

  // Returns an array of values for all vertical points at *x* in *fromY* to *thruY* order
  getCol (x, fromY, thruY) { return this.getRect(x, fromY, x, thruY) }

  // Returns an array of values for all inbounds y points in north-to-south order at *x*
  getFullCol (x) { return this.getRect(x, this.bounds().north(), x, this.bounds().south()) }

  // Returns an array of values for all inbounds x points in west-to-east order at *y*
  getFullRow (y) { return this.getRect(this.bounds().west(), y, this.bounds().east(), y) }

  // Returns an array of values within [*fromX*, *fromY*] to [*thuX*, *thruY*]
  // in *fromY* to *thruY* order, and within each y, in *fromX* to *thruX* order
  getRect (fromX, fromY, thruX, thruY) {
    let dx = this.bounds().xSpacing()
    let dy = this.bounds().ySpacing()
    const nx = 1 + Math.floor(Math.abs(fromX - thruX) / dx)
    const ny = 1 + Math.floor(Math.abs(fromY - thruY) / dy)
    dy = (fromY < thruY) ? dy : -dy
    dx = (fromX < thruX) ? dx : -dx
    const a = []
    // console.log(`x ${fromX} to ${thruX} by ${dx} n ${nx}, y ${fromY} to ${thruY} by ${dy} n ${ny}`)
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        a.push(this.get((fromX + ix * dx), (fromY + iy * dy)))
      }
    }
    return a
  }

  // Returns an array of values for all horizontal points at *y* in *fromX* to *thruX* order
  getRow (y, fromX, thruX) { return this.getRect(fromX, y, thruX, y) }

  // Sets vertical column of north-south points to *value* and returns *this*
  setCol (x, fromY, thruY, value) { return this.setRect(x, fromY, x, thruY, value) }

  // Sets vertical column of all inbounds north-south points to *value* and returns *this*
  setFullCol (x, value) { return this.setRect(x, this.bounds().north(), x, this.bounds().south(), value) }

  // Sets horizontal row of all inbounds west-east points to *value* and returns *this*
  setFullRow (y, value) { return this.setRect(this.bounds().west(), y, this.bounds().east(), y, value) }

  // Sets a rectangular area of points to *value* and returns *this*
  setRect (fromX, fromY, thruX, thruY, value) {
    const x1 = Math.min(fromX, thruX)
    const x2 = Math.max(fromX, thruX)
    const y1 = Math.min(fromY, thruY)
    const y2 = Math.max(fromY, thruY)
    for (let y = y1; y <= y2; y += this.bounds().ySpacing()) {
      for (let x = x1; x <= x2; x += this.bounds().xSpacing()) {
        this.set(x, y, value)
      }
    }
    return this
  }

  // Sets horizontal row of west-east points to *value* and returns *this*
  setRow (y, fromX, thruX, value) { return this.setRect(fromX, y, thruX, y, value) }
}
