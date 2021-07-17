import { GeoCoord } from './GeoCoord.js'

export class GeoTime extends GeoCoord {
  constructor (x, y, time) {
    super(x, y)
    this._time = time
  }

  setTime (time = 0) { this._time = time; return this }

  time () { return this._time }
}
