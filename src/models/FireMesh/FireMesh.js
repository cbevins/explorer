import { FireMeshLine } from './FireMeshLine.js'
import { Period } from '../GeoFire/Period.js'

export class FireMesh {
  /**
   * Creates the FireMesh
   * @param {GeoBounds} bounds
   * @param {FireMeshIgnitionEllipseProvider} ignitionEllipseProvider
   */
  constructor (bounds, ignitionEllipseProvider) {
    this._bounds = bounds
    this._ellipseProvider = ignitionEllipseProvider
    // Array of horizontal mesh lines, one for each *y* position
    this._horz = []
    for (let y = bounds.north(); y >= bounds.south(); y -= bounds.ySpacing()) {
      this._horz.push(new FireMeshLine(y))
    }
    this._ignEllipse = null
    this._ignitions = [] // Perimeter ignition points at start of burnForPeriod()
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

  fireBehavior () { return this._ignEllipse._fire }

  fireInput () { return this._ignEllipse._fire.input }

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

  // Returns reference to the current ignition point fire ellipse (changes often!)
  ignEllipse () { return this._ignEllipse }

  ignitionPoints () { return this._ignitions }

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

  burnForPeriod (duration) {
    // Update the current burning period
    this.period().update(duration)
    const time = this.period().begins()

    // Find and expand all the burned perimeter points
    this._ignitions = this.getIgnitionPoints()
    this._ignitions.forEach(([ignX, ignY]) => {
      this._ignEllipse = this.getIgnitionEllipse(ignX, ignY, time, duration)
      this.expandIgnitionPoint(ignX, ignY, this._ignEllipse)
    })
  }

  expandIgnitionPoint (ignX, ignY, ellipse) {
    // Overlay the ignition ellipse mesh lines onto this ignition point
    // let str = 'Ellipse Overlays:\n'
    ellipse.hlines().forEach(([hy, x1, x2], idx) => {
      // str += `Ellipse y=${hy.toFixed(2)} x1=${x1.toFixed(2)} x2=${x2.toFixed(2)} Mesh y=${(hy + ignY).toFixed(2)} x1=${(x1 + ignX).toFixed(2)} x2=${(x2 + ignX).toFixed(2)}\n`
      const line = this.horzLineAt(hy + ignY)
      line.overlayBurned(ignX + x1, ignX + x2)
    })
    // console.log(str)
  }

  getIgnitionEllipse (x, y, time, duration) {
    return this._ellipseProvider.ignitionEllipseAt(x, y, time, duration, this.bounds().xSpacing())
  }

  getIgnitionPoints () {
    const pts = []
    this._horz.forEach(line => {
      const y = line.anchor()
      line.segments().forEach(segment => {
        if (segment.isBurned()) {
          pts.push([segment.begins(), y])
          if (segment.begins() !== segment.ends()) { pts.push([segment.ends(), y]) }
        }
      })
    })
    return pts
  }

  // Ignites the point closest to [x, y]
  // by adding both a horizontal and a vertical Burned FireMeshSegment.
  igniteAt (x, y) { return this.horzLineAt(y).igniteAt(x) && this.vertLineAt(x).igniteAt(y) }
}
