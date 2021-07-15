export class Period {
  constructor (begins, ends, number) {
    // NOTE that *begins* IS WITHIN the period, while *ends* is NOT WITHIN the period
    this._begins = (begins === undefined) ? 0 : begins
    this._ends = (ends === undefined) ? 0 : ends
    this._number = (number === undefined) ? 0 : number
  }

  begins () { return this._begins }

  contains (t) { return t >= this.begins() && t < this.ends() }

  duration () { return this.ends() - this.begins() }

  ends () { return this._ends }

  midpoint () { return this.begins() + this.duration() / 2 }

  number () { return this._number }
}
