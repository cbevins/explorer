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
    this._horz = []
    for (let y = bounds.north(); y >= bounds.south(); y -= bounds.ySpacing()) {
      this._horz.push(new FireMeshLine(y))
    }
    this._period = new Period()
    this._vert = []
    for (let x = bounds.west(); x <= bounds.east(); x += bounds.xSpacing()) {
      this._vert.push(new FireMeshLine(x))
    }
  }

  // ---------------------------------------------------------------------------
  // Public property accessors
  // ---------------------------------------------------------------------------

  bounds () { return this._bounds }

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

  period () { return this._period }

  vertArray () { return this._vert }

  // Returns index of vertical line closest to *x*
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

  burnForPeriod (duration) {
    // Update the current burning period
    this.period().update(duration)

    // Expand the endpoints of every Burned FireMeshSegment
    this._horz.forEach((line, lidx) => {
      const y = line.anchor()
      line.segments().forEach((segment, sidx) => {
        if (segment.isBurned()) {
          const input0 = this._fireInputProvider.get(segment.begins(), y, this.period().begins(), duration)
          const fire0 = this._fireInputProvider.getFireBehavior(input0)
          const input1 = this._fireInputProvider.get(segment.ends(), y, this.period().begins(), duration)
          const fire1 = this._fireInputProvider.getFireBehavior(input1)
        }
      })
    })
  }

  igniteAt (x, y) {
  }
}
