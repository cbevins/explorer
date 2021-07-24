const Degrees = []
for (let deg = 0; deg <= 360; deg += 1) {
  Degrees.push({ dx: Math.cos(deg * Math.PI / 180), dy: Math.sin(deg * Math.PI / 180) })
}

/**
 * Determines the grid line intersections between two points along a single (x or y) axis
 * @param {number} p0 Starting point on a zero-origin axis (may be negative, zero, or positive)
 * @param {number} p1 Ending point on a zero-origin axis (may be negative, zero, or positive)
 * @param {number} spacing Distance between grid lines
 * @returns {array} Array of crossed grid line axis values
 */
function _gridCrossings (p0, p1, spacing) {
  const x = []
  let first
  if (p0 < p1) { // traversing west-to-east OR south-to-north
    // if already ON the line, then already IN the cell and the line is NOT traversed
    // So if p=100 and spacing=10, first traversed first tic is 110
    first = spacing * (Math.floor(p0 / spacing) + 1) // first tic traversed to the east or north
    for (let p = first; p <= p1; p += spacing) { x.push(p) }
  } else { // traversing east-to-west or north-to-south
    // If already ON the line
    // So if p=100 and spacing=10, first traversed tic is 90
    first = spacing * (Math.ceil(p0 / spacing) - 1) // first tic traversed to the west or south
    for (let p = first; p >= p1; p -= spacing) { x.push(p) }
  }
  return x
}

/**
 * Determines grid line intersection along a directed line segment, i.e.,
 * sprite traversal vector during a time period.
 * @param {number} x0 Starting point x-coordinate
 * @param {number} y0 Ending point y-coordinate
 * @param {number} x1 Ending point x-coordinate
 * @param {number} y1 Ending point y-coordinate
 * @param {number} spacing Distance between x-axis and y-axis grid lines
 * @returns {array} Array of {x, y, d2} objects indicating the grid lines
 *  crossed in traversal order where d2 is distance squared from starting point.
 */
export function vectorPath (x0, y0, x1, y1, spacing) {
  const xings = []
  const dx = x1 - x0
  const dy = y1 - y0
  if (dx === 0) {
    _gridCrossings(y0, y1, spacing).forEach(y => {
      xings.push({ x: x0, y: y, d2: (y - y0) * (y - y0) })
    })
    return xings
  } else if (dy === 0) {
    _gridCrossings(x0, x1, spacing).forEach(x => {
      xings.push({ x: x, y: y0, d2: (x - x0) * (x - x0) })
    })
    return xings
  }
  // y = mx + c
  const m = dy / dx
  // c = y - mx
  const c = y0 - (m * x0)
  _gridCrossings(y0, y1, spacing).forEach(y => {
    const x = (y - c) / m
    const d2 = (x - x0) * (x - x0) + (y - y0) * (y - y0)
    xings.push([x, y, d2])
  })
  _gridCrossings(x0, x1, spacing).forEach(x => {
    const y = m * x + c
    const d2 = (x - x0) * (x - x0) + (y - y0) * (y - y0)
    xings.push([x, y, d2])
  })
  xings.sort(function (a, b) { return a[2] - b[2] })
  return xings
}

export class FireFly {
  constructor (x, y, degrees = 0, velocity = 1) {
    this.x = x
    this.y = y
    this.deg = degrees
    this.vel = velocity
    this.spawn = false
    this.setDirection(degrees)
    this.prev = null
    this.next = null
  }

  // Moves from current [x, y] to next [x, y] using current direction and velocity
  move (time = 1) {
    this.x += time * this.vel * this.dx
    this.y += time * this.vel * this.dy
    return this
  }

  // Returns an array of the grid line crossings
  nextPath (spacing) {
    const [nextX, nextY] = this.nextPos()
    return vectorPath(this.x, this.y, nextX, nextY, spacing)
  }

  // Returns the next [x, y] without actually recording it
  nextPos (time = 1) { return [this.x + time * this.vel * this.dx, this.y + time * this.vel * this.dy] }

  left () { return this.setDirection((270 + this.deg) % 360) }
  reverse () { return this.setDirection((180 + this.deg) % 360) }
  right () { return this.setDirection((90 + this.deg) % 360) }

  setDirection (degrees) {
    this.deg = Math.round(degrees % 360)
    return this._updateDxDy()
  }

  setVelocity (velocity) {
    this.v = velocity
    return this._updateDxDy()
  }

  // Should be called whenever direction or velocity changes
  _updateDxDy () {
    this.dx = Math.cos(this.deg * Math.PI / 180)
    this.dy = Math.sin(this.deg * Math.PI / 180)
    return this
  }
}
