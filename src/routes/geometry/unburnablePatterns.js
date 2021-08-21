
export function setUnburnablePattern (fireGrid, patterns) {
  if (patterns.shortCol) {
    fireGrid.setUnburnableCol(1250, 4250, 4750) // at x=1250 (col 25), y=4250 (row 75) to y=4750 (row 25)
  }
  if (patterns.shortRow) {
    fireGrid.setUnburnableRow(4750, 1250, 1750) // at y=4750 (row 25), x=1250 (col 25) to x=1750 (col 75)
  }
  if (patterns.colHole) {
    fireGrid.setUnburnableCol(1250, 4500, 5000) // at x=1250 (col 25) y=5000 (row 0) to y=4500 (row=50)
    fireGrid.setUnburnableCol(1250, 4000, 4480)
  }
  if (patterns.roads) {
    fireGrid.setUnburnableCol(1500, 4250, 4750)
    fireGrid.setUnburnableCol(1700, 4250, 4750)
    fireGrid.setUnburnableCol(1900, 4250, 4750)
  }
}
