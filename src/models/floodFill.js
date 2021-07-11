/*

1 Grid.ignitionPoint(gridCol, gridRow) calls:
  const fire = new Fire(x, y, t)
  const ellipse = new Ignition(fire.length, fire.width, fire.heading, rowHeight)
  ellipse.grow(this, gridCol, gridRow)

2 Ellipse.grow(grid, gridCol, gridRow) keeps track of direction, source, visitation, etc
  Recursively calls Ellipse.visitNeighbor(), which-
  - ensures neighbor cell is inbounds and inside ellipse
  - calls grid.mayEnter(elCol, elRow)

// Returns FALSE if out-of-bounds or unburnable
// Otherwise, if unburned, sets the burning period
Grid.mayEnter(col, row)
*/

// Cell status enums
export const ControlLine = -3
export const Unburnable = -2
export const OutOfBounds = -1
export const Unburned = 9999999999

// Cell traversal source and direction enums
export const North = 0
export const East = 1
export const South = 2
export const West = 3
export const Ignition = 4
export const oppositeDir = [South, West, North, East, South] // Note opposite[Ignition] === South
export const Unvisited = 5

export class Ellipse {
  constructor (cols, rows, ignRow, ignCol) {
    this._cols = cols
    this._rows = rows
    this._ignCol = ignCol
    this._ignRow = ignRow
    this._inside = new Array(cols * rows).fill(false)
  }

  cellInEllipse (col, row) { return this._inside[col + row * this._cols] }

  cellInGrid (col, row) { return col >= 0 && row >= 0 && col < this._cols && row < this._rows }

  setSegment (row, col0, col1, isInside) {
    const idx1 = col0 + row * this._cols
    const idx2 = col1 + row * this._cols
    for (let idx = idx1; idx <= idx2; idx++) { this._inside[idx] = isInside }
  }
}

export class Grid {
  constructor (cols, rows) {
    this._cols = cols
    this._rows = rows
    this._ignited = new Array(cols * rows).fill(Unburned)
    this._source = new Array(cols * rows).fill(Unvisited)
    this._dir = new Array(cols * rows).fill(Unvisited)
    this._period = 0
  }

  cellColRow (idx) { return [(idx % this._cols), (idx / this._rows >>> 0)] }

  cellInEllipse (gridCol, gridRow) {
    const e = this._ellipse
    const col = e._ignCol + (gridCol - this._ignCol)
    const row = e._ignRow + (gridRow - this._ignRow)
    return e.cellInGrid(col, row) && e.cellInEllipse(col, row)
  }

  cellInGrid (col, row) { return col >= 0 && row >= 0 && col < this._cols && row < this._rows }

  cellNeighbor (fromCol, fromRow, towardsDir) {
    if (towardsDir === North) return [fromCol, fromRow + 1]
    if (towardsDir === South) return [fromCol, fromRow - 1]
    if (towardsDir === East) return [fromCol + 1, fromRow]
    if (towardsDir === West) return [fromCol - 1, fromRow]
  }

  cellUnburnable (col, row) {
    const idx = this.idx(col, row)
    return this._ignited[idx] <= OutOfBounds
  }

  cellVisited (col, row) {
    const idx = this.idx(col, row)
    return this._source[idx] === Unvisited
  }

  grow () {
    this._period++
    // Visit each unignited, burnable cell adjacent to any burned cell
    this._fireFront = this.getFireFront()
    this._fireFront.forEach(idx => {
      [this._ignCol, this._ignRow] = this.cellColRow(idx) // Save the current fire front location
      // Get an ignition fire ellipse template at this cell and period
      // The ellipse is a grid with width(), height(), ix(), iy(), and inbounds()
      this._ellipse = this.getEllipse(idx, this._period)
      // Ignite all reachable cells within the ellipse
      this.igniteCellAt(idx)
    })
  }

  setAllUnVisited () { this._dir = new Array(this._cols * this._rows).fill(Unvisited) }

  // Sets the cell's ignition period
  setCellIgnited (idx) { this._ignited[idx] = this._period }

  // Set's the cell's ignition source (North, East, South, West, or Ignition)
  setCellSource (idx, source) { this._source[idx] = source }

  // Ignites a single cell by overlaying the ignition ellipse template and flood filling
  igniteCellAt (idx) {
    // Initialize all cell sources within the ellipse to Unvisited
    this.setAllUnvisited() // \TODO Only set the cells in the ellipse bounds

    // Since only unignited cells can be an ignition point, set its period
    this.setCellIgnited(idx)

    // Set the cell source, which flags it as visited
    this.setCellSource(idx, Ignition)

    // Visit all four neighbors
    ;[North, East, South, West].forEach(towards => {
      this.igniteCellNeighbor(idx, towards)
    })
  }

  igniteCellNeighbor (fromIdx, fromDir) {
    const [fromCol, fromRow] = this.cellColRow(fromIdx)
    // Get this cell's col and row
    const [col, row] = this.cellNeighbor(fromCol, fromRow, fromDir)
    // Return if this cell is not in the grid bounds
    if (!this.cellInGrid(col, row)) return
    // Return if this cell is not in the ignition ellipse bounds
    if (!this.cellInEllipse(col, row)) return
    // Return if this cell has already been visited (i.e., source !== Unvisited)
    const idx = this.cellIdx(col, row)
    if (this.cellVisited(idx)) return
    // Return if this cell is Unburnable
    if (this.cellUnburnable(idx)) return
    // If Unburned, set this cell's burning period
    this.setCellIgnited(idx)
    // Set this cell's source, which also flags it as Visited
    const source = oppositeDir[fromDir]
    this.setCellSource(idx, source)
    // Visit all four neighbors
    ;[North, East, South, West].forEach(towards => {
      if (towards !== source) this.visitFrom(idx, towards)
    })
  }
}
