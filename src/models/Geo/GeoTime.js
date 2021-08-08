/**
 * A GeoCoord with a time property.
 */
import { GeoCoord } from './GeoCoord.js'

export class GeoTime extends GeoCoord {
  constructor (x, y, time = 0) {
    super(x, y)
    this._time = time
  }

  set (x = 0, y = 0, t = 0) {
    this._xy = [x, y]
    this._time = t
    return this
  }

  setTime (time = 0) { this._time = time; return this }

  time () { return this._time }
}
