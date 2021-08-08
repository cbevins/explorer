import { Grid } from './Grid.js'

// Cell traversal source and direction enums
export const North = 0
export const East = 1
export const South = 2
export const West = 3
export const Origin = 4
export const oppositeDir = [South, West, North, East, South] // Note opposite[Ignition] === South
export const Unvisited = 5

export class GridWalker {
  constructor (cols, rows) {
    this._open = new Grid(cols, rows, true) // Only open cells may be traversed
    this._source = new Grid(cols, rows, Unvisited)
  }

  cellNeighbor (fromCol, fromRow, towardsDir) {
    if (towardsDir === North) return [fromCol, fromRow + 1]
    if (towardsDir === South) return [fromCol, fromRow - 1]
    if (towardsDir === East) return [fromCol + 1, fromRow]
    if (towardsDir === West) return [fromCol - 1, fromRow]
  }

  /**
   * Begins walking the grid until all traversable cells have been visited.
   * @param {number} startCol Starting column index
   * @param {number} startRow Starting row index
   * @param {function} mayTraverse Reference to a function with the signature (col, row)
   * and returns TRUE if GridWlaker may enter.
   */
  walk (startCol, startRow, client) {
    this._client = client
    this._source.fill(Unvisited)
    this._source.setColRow(startCol, startRow, Origin)
    ;[North, East, South, West].forEach(towards => {
      this.traverse(startCol, startRow, towards)
    })
  }

  traverse (fromCol, fromRow, fromDir) {
    // Get this cells's col and row
    const [col, row] = this.cellNeighbor(fromCol, fromRow, fromDir)
    // Return if this cell is not in the grid bounds
    if (!this._source.inbounds(col, row)) return
    // Return if this cell is not open
    if (!this._open.getColRow(col, row)) return
    // Return if this cell has already been visited (i.e., source !== Unvisited)
    if (this._source.getColRow(col, row) !== Unvisited) return
    // Return if the client Grid denies permission to traverse
    if (!this._client.mayTraverse(col, row)) return
    // Set this cell's source, which also flags it as Visited
    const source = oppositeDir[fromDir]
    this._source.setColRow(col, row, source)
    // Continue traversal by visitng all three neighbors neighbors
    ;[North, East, South, West].forEach(towards => {
      if (towards !== source) this.traverse(col, row, towards)
    })
  }
}
