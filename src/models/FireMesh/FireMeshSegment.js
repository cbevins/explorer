import { FireMeshCode } from './FireMeshCode.js'

export class FireMeshSegment {
  constructor (begins, ends, code = FireMeshCode.burned()) {
    this._code = code
    this._begins = begins
    this._ends = ends
  }

  begins () { return this._begins }
  code () { return this._code }
  ends () { return this._ends }
  isBurnable () { return this._code >= 0 }
  isBurned () { return this._code > 0 }
  isUnburned () { return this._code === 0 }
  isUnburnable () { return this._code < 0 }

  // Returns TRUE if *position* is within *this* segment
  contains (position) { return position >= this._begins && position <= this._ends }

  // Returns TRUE if *this* segment follows *position*
  follows (position) { return position < this._begins }

  // Returns TRUE if *this* segment preceeds *position*
  preceeds (position) { return position > this._ends }
}
