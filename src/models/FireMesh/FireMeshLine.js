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

  isBurnableAt (position) { return FireMeshCode.isBurnable(this._codeAt(position)) }

  isBurnedAt (position) { return FireMeshCode.isBurned(this._codeAt(position)) }

  isUnburnableAt (position) { return FireMeshCode.isUnburnable(this._codeAt(position)) }

  isUnburnedAt (position) { return FireMeshCode.isUnburned(this._codeAt(position)) }

  segment (idx) { return this._segments[idx] }

  segments () { return this._segments }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  // Returns the fire segment code at *position*
  _codeAt (position) {
    // Find the first segment that contains or follows *position*
    for (let idx = 0; idx < this._segments.length; idx++) {
      const segment = this._segments[idx]
      // If segment follows *position*, then position is not in ANY segment and is Unburned
      if (segment.follows(position)) {
        return FireMeshCode.unburned()
      } else if (segment.contains(position)) { // If segment contains *position*
        return segment.code() // return the segment code (burned or unburnable)
      }
    }
    // To get here, *position* follows ALL segments, so Unburned
    return FireMeshCode.unburned()
  }

  // ---------------------------------------------------------------------------
  // Client processing methods
  // ---------------------------------------------------------------------------

  addSegment (begins, ends, code = FireMeshCode.burned()) {
    this._segments.push(new FireMeshSegment(begins, ends, code))
  }

  // Inserts a new FireSegment with FireSegmentCodeBurned at *position*,
  // IFF *position is currently Unburned
  igniteAt (position) {
    // Find the first segment that contains or follows *position*
    for (let idx = 0; idx < this._segments.length; idx++) {
      const segment = this._segments[idx]
      if (segment.follows(position)) { // segment follows, so *position* preceeds it
        // insert new Burned FireSegment here
        this._segments.splice(idx, 0, new FireMeshSegment(position, position))
        return true
      } else if (segment.contains(position)) {
        return false // cannot ignite an existing segment (as they are either burned or unburnable)
      }
    }
    // If code reaches here, *position* follows ALL segments, so append a new Burned FireMeshSegment
    this._segments.push(new FireMeshSegment(position, position))
    return true
  }

  overlayBurned (segBegins, segEnds, track = false, str = '') {
    const begins = Math.min(segBegins, segEnds)
    const ends = Math.max(segBegins, segEnds)
    if (track) {
      str += `\noverlayBurned() begins with ${this.segments().length} segments:\n`
      this.segments().forEach(segment => {
        str += `    [${segment.begins().toFixed(2)}, ${segment.ends().toFixed(2)}]\n`
      })
    }

    // console.log(`overlayBurned() ${begins}, ${ends} ${track}`)
    let preceeds = -1 // where to insert a non-overlapping segment
    // Get indices of all segments overlapping begins-to-ends
    const overlaps = []
    for (let idx = 0; idx < this._segments.length; idx++) {
      const segment = this._segments[idx]
      if (ends < segment.begins()) {
        preceeds = idx
        str += `--- CASE 1: ends=${ends} < segment.begins() ${segment.begins()}\n`
        break
      } else if (begins <= segment.ends() && ends >= segment.begins()) {
        str += '--- CASE 2\n'
        overlaps.push(idx)
      }
    }
    // If there are no overlapping segments, insert or append the new segment
    if (!overlaps.length) {
      if (preceeds === -1) {
        str += '--- CASE 3\n'
        this._segments.push(new FireMeshSegment(begins, ends))
      } else {
        str += '--- CASE 4\n'
        this._segments.splice(preceeds, 0, new FireMeshSegment(begins, ends))
      }
    } else {
      // Extend the first overlapping segment and remove the others
      const first = this._segments[overlaps[0]]
      const last = this._segments[overlaps[overlaps.length - 1]]
      const b = Math.min(begins, first.begins())
      const e = Math.max(ends, last.ends())
      first.extend(b, e)
      str += '--- CASE 5\n'
      if (overlaps.length > 1) {
        str += '--- CASE 5+SPLICE\n'
        this._segments.splice(overlaps[0] + 1, overlaps.length - 1)
      }
    }

    // DEBUGGING
    if (track) {
      str += `overlayBurn() ends with ${this.segments().length} segments:\n`
      this.segments().forEach(segment => {
        str += `    [${segment.begins().toFixed(2)}, ${segment.ends().toFixed(2)}]\n`
      })
      console.log(str)
    }
  }
}
