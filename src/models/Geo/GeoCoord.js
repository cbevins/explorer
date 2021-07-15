export class GeoCoord {
  constructor (x = 0, y = 0) {
    this._xy = [x, y]
  }

  set (x = 0, y = 0) { this._xy = [x, y]; return this }

  setx (x = 0) { this._xy[0] = x; return this }

  sety (y = 0) { this._xy[1] = y; return this }

  x () { return this._xy[0] }

  xy () { return this._xy }

  y () { return this._xy[1] }
}
