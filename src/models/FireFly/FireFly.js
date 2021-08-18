import { azimuthOf } from '../Trig/index.js'

export class FireFly {
  constructor (x = 0, y = 0, dx = 0, dy = 1) {
    this._x = x // current location x coordinate
    this._y = y // current location y coordinate
    this._dx = dx // destination x coordinate
    this._dy = dy // destination y coordinate
    this._az = azimuthOf(dx - x, dy - y)
  }

  azimuth () { return this._az }

  destination () { return [this._dx, this._dy] }
  dx () { return this._dx }
  dy () { return this._dy }

  position () { return [this._x, this._y] }
  x () { return this._x }
  y () { return this._y }

  setDestination (dx, dy) {
    this._dx = dx
    this._dy = dy
    return this
  }

  setPosition (x, y) {
    this._x = x
    this._y = y
    return this
  }
}
