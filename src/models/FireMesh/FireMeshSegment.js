import { FireMeshCode } from './FireMeshCode.js'

/**
 * A FireMeshSegment instance is either Unburnable or Burned.
 * Any space between FireMeshSegment instances is Unburned.
 */
export class FireMeshSegment {
  constructor (begins, ends, code = FireMeshCode.burned()) {
    this._code = code // Either FireMeshCode.burned() or FireMeshCode.unburnable()
    this._begins = Math.min(begins, ends)
    this._ends = Math.max(begins, ends)
  }

  begins () { return this._begins }
  code () { return this._code }
  endpoints () { return [this._begins, this._ends] }
  ends () { return this._ends }
  isBurnable () { return FireMeshCode.isBurnable(this._code) }
  isBurned () { return FireMeshCode.isBurned(this._code) }
  isUnburned () { return FireMeshCode.isUnburned(this._code) }
  isUnburnable () { return FireMeshCode.isUnburnable(this._code) }

  // Returns TRUE if *position* is within *this* segment
  contains (position) { return position >= this._begins && position <= this._ends }

  extend (begins, ends) {
    this._begins = begins
    this._ends = ends
    return this
  }

  // Returns TRUE if *this* segment follows *position*
  follows (position) { return position < this._begins }

  length () { return Math.abs(this._ends - this._begins) }

  // Returns TRUE if *this* segment preceeds *position*
  preceeds (position) { return position > this._ends }

  moveBegins (distance) {
    this._begins += distance
    return this
  }

  moveEnds (distance) {
    this._ends += distance
    return this
  }
}
