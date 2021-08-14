import { FireMeshArray } from './FireMeshArray.js'
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
    this._horz = new FireMeshArray(bounds, true)
    this._period = new Period()
    this._vert = new FireMeshArray(bounds, false)
  }

  bounds () { return this._bounds }
  horz () { return this._horz }
  period () { return this._period }
  vert () { return this._vert }

  burnForPeriod (duration) {
    // Update the current burning period
    this.period().update(duration)

    // Expand the endpoints of every Burned FireMeshSegment
    this._horz.lines().forEach((line, lidx) => {
      const y = line.anchor()
      line.segments().forEach((segment, sidx) => {
        if (segment.isBurned()) {
          const input0 = this._fireInputProvider.get(segment.begins(), y, this.period().begins(), duration)
          const input1 = this._fireInputProvider.get(segment.ends(), y, this.period().begins(), duration)
        }
      })
    })
  }
}
