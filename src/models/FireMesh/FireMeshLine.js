import { FireMeshCode } from './FireMeshCode.js'
import { FireMeshSegment } from './FireMeshSegment.js'

export class FireMeshLine {
  constructor (anchor = 0) {
    this._anchor = anchor // geographic easting for vertical scanlines, or northing for horizontal scanlines
    this._segments = [] // FireSegments at this anchor position
  }

  // ---------------------------------------------------------------------------
  // Public property accessors
  // ---------------------------------------------------------------------------

  anchor () { return this._anchor }

  isBurnedAt (position) { return FireMeshCode.isBurned(this._codeAt(position)) }

  isUnburnableAt (position) { return FireMeshCode.isUnburnabled(this._codeAt(position)) }

  isUnburnedAt (position) { return FireMeshCode.isUnburned(this._codeAt(position)) }

  segment (idx) { return this._segments[idx] }

  segments () { return this._segments }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  // Returns the fire segment code at position
  _codeAt (position) {
    // Find the first segment that contains or follows *position*
    for (let idx = 0; idx < this._segments.length; idx++) {
      const segment = this._segments[idx]
      if (segment.follows(position)) { // If segment follows, then *position* is Unburned
        return FireMeshCode.unburned()
      } else if (segment.contains(position)) {
        return segment.code() // *at* is inside an existing segment
      }
    }
    // To get here, *position* follows ALL segments, so Unburned
    return FireMeshCode.unburned()
  }

  // ---------------------------------------------------------------------------
  // Client processing methods
  // ---------------------------------------------------------------------------

  // Inserts a new FireSegment with FireSegmentCodeBurned at *position*,
  // IFF *position is currently Unburned
  igniteAt (position) {
    // Find the first segment that contains or follows *position*
    for (let idx = 0; idx < this._segments.length; idx++) {
      const segment = this._segments[idx]
      if (segment.follows(position)) { // segment follows, so *position* preceeds it
        // insert new FireSegment here
        this._segments.splice(idx, 0, new FireMeshSegment(position, position))
        return true
      } else if (segment.contains(position)) {
        return false // cannot ignite an existing segment (as they are either burned or unburnable)
      }
    }
    // If code reaches here, *position* follows ALL segments, so append a new FireMeshSegment
    this._segments.push(new FireMeshSegment(position, position))
    return true
  }
}