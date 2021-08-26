import { FireMeshEllipse } from './FireMeshEllipse.js'
import { FireMeshLine } from './FireMeshLine.js'
import { Period } from '../GeoFire/Period.js'

export class FireMesh {
  /**
   * Creates the FireMesh
   * @param {GeoBounds} bounds
   * @param {FireInputProviderInterface} fireInputProvider
   * @param {FireBehaviorProviderInterface} fireBehaviorProvider
   */
  constructor (bounds, fireInputProvider, fireBehaviorProvider) {
    this._bounds = bounds
    this._fireBehaviorProvider = fireBehaviorProvider
    this._fireInputProvider = fireInputProvider
    // Array of horizontal mesh lines, one for each *y* position
    this._horz = []
    for (let y = bounds.north(); y >= bounds.south(); y -= bounds.ySpacing()) {
      this._horz.push(new FireMeshLine(y))
    }
    this._ignitions = [] // Newly ignited points during burnForPeriod()
    this._period = new Period()
    // Array of vertical mesh lines, one for each *x* position
    this._vert = []
    for (let x = bounds.west(); x <= bounds.east(); x += bounds.xSpacing()) {
      this._vert.push(new FireMeshLine(x))
    }
  }

  // ---------------------------------------------------------------------------
  // Public property accessors
  // ---------------------------------------------------------------------------

  bounds () { return this._bounds }

  // Returns reference to the entire horizontal FireMeshLine array
  horzArray () { return this._horz }

  // Returns index of horizontal FireMeshLine closest to *y*
  horzIdxAt (y) {
    const pt = this.bounds().snapY(y)
    return Math.max(0, Math.min(this.bounds().yInterval(pt), this._horz.length - 1))
  }

  // Returns reference to the horizontal FireMeshLine at array offset *idx*
  horzLine (idx) { return this._horz[idx] }

  // Returns reference to horizontal FireMeshLine most closely anchored to *y*
  horzLineAt (y) { return this._horz[this.horzIdxAt(y)] }

  // Returns reference to the current burning period
  period () { return this._period }

  // Returns reference to the entire vertical FireMeshLine array
  vertArray () { return this._vert }

  // Returns index of vertical FireMeshLine closest to *x*
  vertIdxAt (x) {
    const xpt = this.bounds().snapX(x)
    return Math.min(Math.max(0, this.bounds().xInterval(xpt)), this._vert.length - 1)
  }

  // Returns reference to the vertical FireMeshLine at array offset *idx*
  vertLine (idx) { return this._vert[idx] }

  // Returns reference to vertical FireMeshLine most closely anchored to *x*
  vertLineAt (x) { return this._vert[this.vertIdxAt(x)] }

  // ---------------------------------------------------------------------------
  // Public mutator and processor methods
  // ---------------------------------------------------------------------------

  burnForPeriodNew (duration) {
    // Update the current burning period
    this.period().update(duration)

    // Expand the endpoints of every Burned FireMeshSegment
    this._ignitions = []
    let input, fire, ellipse, before, distance, crossings

    this._horz.forEach((line, lidx) => {
      const y = line.anchor()
      line.segments().forEach((segment, sidx) => {
        if (segment.isBurned()) {
          // Beginning point is moved a negative amount
          input = this._fireInputProvider.getFireInput(segment.begins(), y, this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.west * duration
          // If not the first segment, ensure distance will not overlap the previous segment
          if (sidx > 0) {
            distance = Math.min(distance, (segment.begins() - line.segment(sidx - 1).ends()))
          }
          before = segment.begins()
          segment.moveBegins(-distance)
          // Spawn ignitions for all vertical lines crossed by this extension
          crossings = this.bounds().xCrossings(before, segment.begins())
          crossings.forEach(x => { this._ignitions.push([x, y]) })

          // End point is moved a positive amount
          input = this._fireInputProvider.getFireInput(segment.ends(), y, this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.east * duration
          // If not the last segment, ensure distance will not overlap the next segment
          if (sidx < line.segments().length - 1) {
            distance = Math.min(distance, (line.segment(sidx + 1).begins() - segment.ends()))
          }
          before = segment.ends()
          segment.moveEnds(distance)
          // Spawn ignitions for all vertical lines crossed by this extension
          crossings = this.bounds().xCrossings(before, segment.ends())
          crossings.forEach(x => { this._ignitions.push([x, y]) })
        }
      })
    })

    this._vert.forEach((line, lidx) => {
      const x = line.anchor()
      line.segments().forEach((segment, sidx) => {
        if (segment.isBurned()) {
          // Beginning point is moved a negative amount
          input = this._fireInputProvider.getFireInput(x, segment.begins(), this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.south * duration
          // If not the first segment, ensure distance will not overlap the previous segment
          if (sidx > 0) {
            distance = Math.min(distance, (segment.begins() - line.segment(sidx - 1).ends()))
          }
          before = segment.begins()
          segment.moveBegins(-distance)
          // Spawn ignitions for all horizontal lines crossed by this extension
          crossings = this.bounds().yCrossings(before, segment.begins())
          crossings.forEach(y => { this._ignitions.push([x, y]) })

          // End point is moved a positive amount
          input = this._fireInputProvider.getFireInput(x, segment.ends(), this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.north * duration
          // If not the last segment, ensure distance will not overlap the next segment
          if (sidx < line.segments().length - 1) {
            distance = Math.min(distance, (line.segment(sidx + 1).begins() - segment.ends()))
          }
          before = segment.ends()
          segment.moveEnds(distance)
          // Spawn ignitions for all horizontal lines crossed by this extension
          crossings = this.bounds().yCrossings(before, segment.ends())
          crossings.forEach(y => { this._ignitions.push([x, y]) })
        }
      })
    })
    return this
  }

  burnForPeriod (duration) {
    // Update the current burning period
    this.period().update(duration)

    // Expand the endpoints of every Burned FireMeshSegment
    this._ignitions = []
    let input, fire, before, distance, crossings

    this._horz.forEach((line, lidx) => {
      const y = line.anchor()
      line.segments().forEach((segment, sidx) => {
        if (segment.isBurned()) {
          // Beginning point is moved a negative amount
          input = this._fireInputProvider.getFireInput(segment.begins(), y, this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.west * duration
          // If not the first segment, ensure distance will not overlap the previous segment
          if (sidx > 0) {
            distance = Math.min(distance, (segment.begins() - line.segment(sidx - 1).ends()))
          }
          before = segment.begins()
          segment.moveBegins(-distance)
          // Spawn ignitions for all vertical lines crossed by this extension
          crossings = this.bounds().xCrossings(before, segment.begins())
          crossings.forEach(x => { this._ignitions.push([x, y]) })

          // End point is moved a positive amount
          input = this._fireInputProvider.getFireInput(segment.ends(), y, this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.east * duration
          // If not the last segment, ensure distance will not overlap the next segment
          if (sidx < line.segments().length - 1) {
            distance = Math.min(distance, (line.segment(sidx + 1).begins() - segment.ends()))
          }
          before = segment.ends()
          segment.moveEnds(distance)
          // Spawn ignitions for all vertical lines crossed by this extension
          crossings = this.bounds().xCrossings(before, segment.ends())
          crossings.forEach(x => { this._ignitions.push([x, y]) })
        }
      })
    })

    this._vert.forEach((line, lidx) => {
      const x = line.anchor()
      line.segments().forEach((segment, sidx) => {
        if (segment.isBurned()) {
          // Beginning point is moved a negative amount
          input = this._fireInputProvider.getFireInput(x, segment.begins(), this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.south * duration
          // If not the first segment, ensure distance will not overlap the previous segment
          if (sidx > 0) {
            distance = Math.min(distance, (segment.begins() - line.segment(sidx - 1).ends()))
          }
          before = segment.begins()
          segment.moveBegins(-distance)
          // Spawn ignitions for all horizontal lines crossed by this extension
          crossings = this.bounds().yCrossings(before, segment.begins())
          crossings.forEach(y => { this._ignitions.push([x, y]) })

          // End point is moved a positive amount
          input = this._fireInputProvider.getFireInput(x, segment.ends(), this.period().begins(), duration)
          fire = this._fireBehaviorProvider.getFireBehavior(input)
          distance = fire.ros.north * duration
          // If not the last segment, ensure distance will not overlap the next segment
          if (sidx < line.segments().length - 1) {
            distance = Math.min(distance, (line.segment(sidx + 1).begins() - segment.ends()))
          }
          before = segment.ends()
          segment.moveEnds(distance)
          // Spawn ignitions for all horizontal lines crossed by this extension
          crossings = this.bounds().yCrossings(before, segment.ends())
          crossings.forEach(y => { this._ignitions.push([x, y]) })
        }
      })
    })
    return this
  }

  // Ignites the point closest to [x, y]
  // by adding both a horizontal and a vertical Burned FireMeshSegment.
  igniteAt (x, y) { return this.horzLineAt(y).igniteAt(x) && this.vertLineAt(x).igniteAt(y) }
}
