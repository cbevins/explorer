import { FireMeshCode } from './FireMeshCode.js'

/**
 * A FireMeshSegment instance is either Unburnable or Burned.
 * Any space between FireMeshSegment instances is Unburned.
 */
export class FireMeshSegment {
  constructor (begins, ends, code = FireMeshCode.burned()) {
    this._code = code // Either FireMeshCode.burned() or FireMeshCode.unburnable()
    this._begins = begins
    this._ends = ends
  }

  begins () { return this._begins }
  code () { return this._code }
  ends () { return this._ends }
  isBurnable () { return this._code >= 0 }
  isBurned () { return this._code > 0 }
  // isUnburned () { return this._code === 0 }
  isUnburnable () { return this._code < 0 }

  // Returns TRUE if *position* is within *this* segment
  contains (position) { return position >= this._begins && position <= this._ends }

  // Returns TRUE if *this* segment follows *position*
  follows (position) { return position < this._begins }

  // Returns TRUE if *this* segment preceeds *position*
  preceeds (position) { return position > this._ends }

  moveBegins (distance) {
    console.log(`moveBegins(${distance})`)
    this._begins += distance
  }

  moveEnds (distance) {
    console.log(`moveEnds(${distance})`)
    this._ends += distance
  }
}
