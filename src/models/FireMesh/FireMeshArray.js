import { FireMeshLine } from './FireMeshLine.js'

export class FireMeshArray {
  constructor (bounds, isHorizontal = true) {
    this._bounds = bounds
    this._isHorizontal = isHorizontal
    this._lines = []
    if (isHorizontal) {
      for (let y = bounds.north(); y >= bounds.south(); y -= bounds.ySpacing()) {
        this._lines.push(new FireMeshLine(y))
      }
    } else {
      for (let x = bounds.west(); x <= bounds.east(); x += bounds.xSpacing()) {
        this._lines.push(new FireMeshLine(x))
      }
    }
  }

  bounds () { return this._bounds }

  isHorizontal () { return this._isHorizontal }

  isVertical () { return !this._isHorizontal }

  line (idx) { return this._line[idx] }

  lines () { return this._lines }
}
