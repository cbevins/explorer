export function ignitionGridDist (fireGrid) { return ignitionGridProp(fireGrid, 'dist') }
export function ignitionGridTime (fireGrid) { return ignitionGridProp(fireGrid, 'time') }

function ignitionGridProp (fireGrid, prop = 'time') {
  const rows = []
  const grid = fireGrid.ignitionGrid()
  const { west, north, east, south, xSpacing, ySpacing } = grid.bounds().props()
  for (let y = north, idx = 0; y >= south; y -= ySpacing) {
    const row = [y]
    for (let x = west; x <= east; x += xSpacing, idx++) {
      row.push(grid.get(x, y)[prop].toFixed(2))
    }
    rows.push(row)
  }
  return rows
}
