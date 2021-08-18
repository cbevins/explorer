
export class Destination {
  constructor (x, y, idx) {
    this._x = x
    this._y = y
    this._idx = idx
    this._flies = []
  }

  addFireFly (fireFly) { this._flies.push(fireFly) }
  flies () { return this._flies }
  fly (idx) { return this._flies[idx] }
  idx () { return this._idx }
  x () { return this._x }
  y () { return this._y }
}

export class DestinationStore {
  constructor (bounds) {
    this._bounds = bounds
    this._store = new Map()
  }

  // Adds the referenced FireFly to the Destination [dx, dy]
  // Creates the Destination [dx, dy] if necessary
  addFireFly (fireFly) {
    const idx = this._bounds.cellIndex(fireFly.dx(), fireFly.dy())
    if (!this._store.has(idx)) {
      this.create(fireFly.dx(), fireFly.dy())
    } else {
      console.log('Already have', fireFly.dx(), fireFly.dy())
    }
    const dest = this._store.get(idx)
    dest.addFireFly(fireFly)
  }

  bounds () { return this._bounds() }

  create (x, y) {
    const idx = this._bounds.cellIndex(x, y)
    const dest = new Destination(x, y, idx)
    this._store.set(idx, dest)
    return dest
  }

  // Returns an array of the all Destinations in the store
  destinations () { return Array.from(this._store.values()) }

  hasDestination (x, y) {
    const idx = this._bounds.cellIndex(x, y)
    return this._store.has(idx)
  }

  // Returns an array of the cell indices of all Destinations in the store
  indices () { return Array.from(this._store.keys()) }

  size () { return this._store.size }
}
