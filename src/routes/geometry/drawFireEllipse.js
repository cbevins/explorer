/* eslint-disable no-unused-vars */
// THIS ALL ASSUMES *NO* SPATIAL AND TEMPORALY VARIABILITY

// Draws the free-burning GEOMETRICAL fire ellipse based on FireEllipse length and width
export function drawFireEllipse (ctx, fireGrid, ignX, ignY) {
  // Free burning geometrical ellipse
  const fire = fireEllipseGeometry(fireGrid)
  const west = fireGrid.bounds().west()
  const north = fireGrid.bounds().north()
  ctx.beginPath()
  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 5
  const cx = ignX - west + fire.cx // center x: ignition easting plus center easting
  const cy = north - ignY - fire.cy // center y: ignition northing less center northing
  const rx = fire.length / 2
  const ry = fire.width / 2
  const rad = ((fire.heading + 270) % 360) * Math.PI / 180
  ctx.ellipse(cx, cy, rx, ry, rad, 0, 2 * Math.PI)
  ctx.stroke()

  drawFirePoint(ctx, (ignX - west + fire.bx), (north - ignY - fire.by))
  drawFirePoint(ctx, (ignX - west + fire.hx), (north - ignY - fire.hy))
  drawFirePoint(ctx, (ignX - west), (north - ignY))
}

function drawFirePoint (ctx, x, y, color = 'blue', radius = 10) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI)
  ctx.stroke()
}

// Returns an object describing the geometrical fire ellipse
export function fireEllipseGeometry (fireGrid) {
  const fe = fireGrid.fireEllipse()
  const periods = fireGrid.period().number()
  const fire = {}
  fire.bounds = fireGrid.bounds()
  fire.period = fireGrid.period()
  fire.headRos = fe.headRate()
  fire.backRos = fe.backRate()
  fire.lwr = fe.lwr()
  fire.length = (fire.headRos + fire.backRos) * fireGrid.period().ends()
  fire.width = fire.length / fire.lwr
  fire.heading = fe.headDegrees()
  fire.cx = fe.cx() * periods
  fire.cy = fe.cy() * periods
  fire.hx = fe.hx() * periods
  fire.hy = fe.hy() * periods
  fire.bx = fe.bx() * periods
  fire.by = fe.by() * periods
  fire.area = Math.PI * fire.length * fire.length / (4 * fire.lwr)
  fire.perimeter = perimeter(fire.length, fire.width)
  return fire
}

export function fireEllipseStatus (fireGrid) {
  const fire = fireEllipseGeometry(fireGrid)
  const xdist = fireGrid.bounds().xSpacing()
  const ydist = fireGrid.bounds().ySpacing()
  const [points, perim] = fireGrid.gridStatusAt(fireGrid.period().ends())
  const faces = perim.faces // faces at start of most recent burning period

  const sr2 = Math.sqrt(2)
  const estPerim = xdist * (faces[1] + sr2 * faces[2] + (1 + sr2) * faces[3] + 4 * faces[4])
  // const estPerim = xdist * (faces[1] + (0.5 + sr2/2 * faces[2]) + (1 + sr2) * faces[3] + 4 * faces[4])
  const burnedCells = faces[0] + faces[1] + faces[2] + faces[3] + faces[4]
  const estArea = burnedCells * xdist * ydist
  return [
    ['Elapsed Time', fireGrid.period().ends().toFixed(0)],
    ['Geometric Area', fire.area.toFixed(0)],
    ['Grid Estm Area', (estArea).toFixed(0)],
    ['Area % Diff', (100 * (estArea - fire.area) / fire.area).toFixed(2) + '%'],
    ['Geom Burned Cells', (fire.area / xdist / ydist).toFixed(0)],
    ['Grid Burned Cells', (burnedCells).toFixed(0)],
    ['Geometric Perimeter', fire.perimeter.toFixed(0)],
    ['Grid Estm Perimeter', (estPerim).toFixed(0)],
    ['Perimeter % Diff', (100 * (estPerim - fire.perimeter) / fire.perimeter).toFixed(2) + '%'],
    ['Length-to-Width Ratio', (fire.lwr).toFixed(2)]
    // ['Head RoS', fire.headRos.toFixed(2)],
    // ['Back RoS', fire.backRos.toFixed(2)],
    // ['Fire Length', fire.length.toFixed(0)],
    // ['Fire Width', fire.width.toFixed(0)],
    // ['Fire Heading', fire.heading.toFixed(0)],
    // ['Fire Center X', fire.cx.toFixed(2)],
    // ['Fire Center Y', fire.cy.toFixed(2)],
    // ['Fire Head X', fire.hx.toFixed(2)],
    // ['Fire Head Y', fire.hy.toFixed(2)],
    // ['Fire Back X', fire.bx.toFixed(2)],
    // ['Fire Back Y', fire.by.toFixed(2)]
  ]
}

function perimeter (len, wid) {
  const a = 0.5 * len
  const b = 0.5 * wid
  const xm = a + b <= 0 ? 0 : (a - b) / (a + b)
  const xk = 1 + xm * xm / 4 + xm * xm * xm * xm / 64
  return Math.PI * (a + b) * xk
}
