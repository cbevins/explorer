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
    this._horzIgnitions = [] // Horizonatl mesh line perimeter ignition points at start of burnForPeriod()
    this._ignEllipse = null
    this._period = new Period()
    // Array of vertical mesh lines, one for each *x* position
    this._vert = []
    for (let x = bounds.west(); x <= bounds.east(); x += bounds.xSpacing()) {
      this._vert.push(new FireMeshLine(x))
    }
    this._vertIgnitions = [] // Vertical mesh line perimeter ignition points at start of burnForPeriod()
  }

  // ---------------------------------------------------------------------------
  // Public property accessors
  // ---------------------------------------------------------------------------

  bounds () { return this._bounds }

  fireBehavior () { return this._ignEllipse._fire }

  fireInput () { return this._ignEllipse._fire.input }

  // Returns reference to the entire horizontal FireMeshLine array
  horzArray () { return this._horz }

  horzBurnedLines () {
    let n = 0
    this._horz.forEach(line => { if (line.segments().length) n++ })
    return n
  }

  // Returns index of horizontal FireMeshLine closest to *y*
  horzIdxAt (y) {
    const pt = this.bounds().snapY(y)
    return Math.max(0, Math.min(this.bounds().yInterval(pt), this._horz.length - 1))
  }

  // Returns a reference to the current period's horizontal FireMeshLine ignition points
  horzIgnitionPoints () { return this._horzIgnitions }

  // Returns reference to the horizontal FireMeshLine at array offset *idx*
  horzLine (idx) { return this._horz[idx] }

  // Returns reference to horizontal FireMeshLine most closely anchored to *y*
  horzLineAt (y) { return this._horz[this.horzIdxAt(y)] }

  // Returns reference to the current ignition point fire ellipse (changes often!)
  ignEllipse () { return this._ignEllipse }

  // Returns reference to the current burning period
  period () { return this._period }

  // Returns reference to the entire vertical FireMeshLine array
  vertArray () { return this._vert }

  vertBurnedLines () {
    let n = 0
    this._vert.forEach(line => { if (line.segments().length) n++ })
    return n
  }

  // Returns index of vertical FireMeshLine closest to *x*
  vertIdxAt (x) {
    const xpt = this.bounds().snapX(x)
    return Math.min(Math.max(0, this.bounds().xInterval(xpt)), this._vert.length - 1)
  }

  // Returns a reference to the current period's vertical FireMeshLine ignition points
  vertIgnitionPoints () { return this._vertIgnitions }

  // Returns reference to the vertical FireMeshLine at array offset *idx*
  vertLine (idx) { return this._vert[idx] }

  // Returns reference to vertical FireMeshLine most closely anchored to *x*
  vertLineAt (x) { return this._vert[this.vertIdxAt(x)] }

  // Returns TRUE if the backing distance for the burn period duration
  // is less than the mesh resolution, which can lead to ellipse flattening
  warning () { return this._ignEllipse.backDist() < this.bounds().xSpacing() }

  // ---------------------------------------------------------------------------
  // Public mutator and processor methods
  // ---------------------------------------------------------------------------

  burnForPeriod (duration, trackIdx = -1) {
    this.period().update(duration) // Update the current burning period
    const time = this.period().begins()
    // this.burnHorzForPeriod(time, duration, trackIdx)
    this.burnVertForPeriod(time, duration, trackIdx)
  }

  burnHorzForPeriod (time, duration, trackIdx = -1) {
    // Find and expand all the burned perimeter points
    this._horzIgnitions = this.getHorzIgnitionPoints()
    this._horzIgnitions.forEach(([ignX, ignY]) => {
      this._ignEllipse = this.getIgnitionEllipse(ignX, ignY, time, duration)
      this.expandHorzIgnitionPoint(ignX, ignY, this._ignEllipse, trackIdx)
    })

    if (trackIdx >= 0) {
      const line = this._horz[trackIdx]
      let str = `After burnHorzForPeriod() ${this.period().number()} Line ${trackIdx} has ${line.segments().length} segments:\n`
      line.segments().forEach(segment => {
        str += `    [${segment.begins().toFixed(2)}, ${segment.ends().toFixed(2)}]\n`
      })
      console.log(str)
    }
  }

  burnVertForPeriod (time, duration, trackIdx = -1) {
    this._vertIgnitions = this.getVertIgnitionPoints()
    this._vertIgnitions.forEach(([ignX, ignY]) => {
      this._ignEllipse = this.getIgnitionEllipse(ignX, ignY, time, duration)
      this.expandVertIgnitionPoint(ignX, ignY, this._ignEllipse, trackIdx)
    })

    if (trackIdx >= 0) {
      const line = this._vert[trackIdx]
      let str = `After burnVertForPeriod() ${this.period().number()} Line ${trackIdx} has ${line.segments().length} segments:\n`
      line.segments().forEach(segment => {
        str += `    [${segment.begins().toFixed(2)}, ${segment.ends().toFixed(2)}]\n`
      })
      console.log(str)
    }
  }

  // Overlays the ignition ellipse mesh lines onto this ignition point
  expandHorzIgnitionPoint (ignX, ignY, ellipse, trackIdx = -1) {
    const str1 = `Track=${trackIdx} Period=${this.period().number()} Ign Pt=[${ignX.toFixed(2)}, ${ignY.toFixed(2)}] `
    ellipse.hlines().forEach(([hy, x1, x2]) => {
      const str2 = str1 + `IgnEllipse y=${hy.toFixed(2)} x=${x1.toFixed(2)} to ${x2.toFixed(2)} `
      const line = this.horzLineAt(hy + ignY)
      const lidx = this.horzIdxAt(hy + ignY)
      let str3 = str2
      if (lidx === trackIdx) {
        str3 += `Overlay y=${hy + ignY} begins=${(ignX + x1).toFixed(2)} ends=${(ignX + x2).toFixed(2)}\n`
      }
      line.overlayBurned(ignX + x1, ignX + x2, (trackIdx === lidx), str3)
    })
  }

  // Overlays the ignition ellipse mesh lines onto this ignition point
  expandVertIgnitionPoint (ignX, ignY, ellipse, trackIdx = -1) {
    const str1 = `Track=${trackIdx} Period=${this.period().number()} Ign Pt=[${ignX.toFixed(2)}, ${ignY.toFixed(2)}] `
    ellipse.vlines().forEach(([vx, y1, y2]) => {
      const str2 = str1 + `IgnEllipse x=${vx.toFixed(2)} y=${y1.toFixed(2)} to ${y2.toFixed(2)} `
      const line = this.vertLineAt(vx + ignX)
      const lidx = this.vertIdxAt(vx + ignX)
      let str3 = str2
      if (lidx === trackIdx) {
        str3 += `Overlay x=${vx + ignX} begins=${(ignY + y1).toFixed(2)} ends=${(ignY + y2).toFixed(2)}\n`
      }
      line.overlayBurned(ignY + y1, ignY + y2, (trackIdx === lidx), str3)
    })
  }

  getIgnitionEllipse (x, y, time, duration) {
    return this._ellipseProvider.ignitionEllipseAt(x, y, time, duration, this.bounds().xSpacing())
  }

  // This version only gets segment endpoints
  getIgnitionEndPoints () {
    const pts = []
    this._horz.forEach(line => {
      const y = line.anchor()
      line.segments().forEach(segment => {
        if (segment.isBurned()) {
          pts.push([segment.begins(), y])
          if (segment.begins() !== segment.ends()) {
            pts.push([segment.ends(), y])
          }
        }
      })
    })
    return pts
  }

  // This version gets segment midpoints that have unburned neighboring north-south points
  getHorzIgnitionPoints () {
    const spacing = this.bounds().xSpacing()
    const pts = []
    this._horz.forEach((line, lineIdx) => {
      const y = line.anchor()
      const above = (lineIdx === 0) ? null : this.horzLine(lineIdx - 1)
      const below = (lineIdx >= this._horz.length - 1) ? null : this.horzLine(lineIdx + 1)
      line.segments().forEach(segment => {
        if (segment.isBurned()) {
          pts.push([segment.begins(), y]) // always ignite the first endpoint
          // ignite any points between the endpoints that is unburned either above or below it
          for (let x = segment.begins() + spacing; x < segment.ends(); x += spacing) {
            if ((above && above.isUnburnedAt(x)) || (below && below.isUnburnedAt(x))) pts.push([x, y])
          }
          // ignite the second endpoint if its not already in the array
          if (pts[pts.length - 1][0] !== segment.ends()) pts.push([segment.ends(), y])
        }
      })
    })
    return pts
  }

  // This version gets segment midpoints that have unburned neighboring north-south points
  getVertIgnitionPoints () {
    // const spacing = this.bounds().ySpacing()
    const pts = []
    this._vert.forEach((line, lineIdx) => {
      const x = line.anchor()
      // const left = (lineIdx === 0) ? null : this.vertLine(lineIdx - 1)
      // const right = (lineIdx >= this._vert.length - 1) ? null : this.vertLine(lineIdx + 1)
      line.segments().forEach(segment => {
        if (segment.isBurned()) {
          pts.push([x, segment.begins()]) // always ignite the first endpoint
          // ignite any points between the endpoints that is unburned either above or below it
          // for (let y = segment.begins() + spacing; y < segment.ends(); y += spacing) {
          //   if ((left && left.isUnburnedAt(y)) || (right && right.isUnburnedAt(y))) pts.push([x, y])
          // }
          // ignite the second endpoint if its not already in the array
          if (pts[pts.length - 1][1] !== segment.ends()) pts.push([x, segment.ends()])
        }
      })
    })
    return pts
  }

  // Ignites the point closest to [x, y]
  // by adding both a horizontal and a vertical Burned FireMeshSegment.
  igniteAt (x, y) { return this.horzLineAt(y).igniteAt(x) && this.vertLineAt(x).igniteAt(y) }
}
