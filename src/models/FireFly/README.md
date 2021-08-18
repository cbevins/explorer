# FireFly Fire Spread Game

## Definitions

- A *Grid Point* is a specific, discrete location in the landscape.

- A *Landscape* is a grid of equidistant grid points oriented along global west-to-east and south-to-north axis.  The distance between grid points is on the order of several feet or metres.

- A *Burning Period* is a time period during which travel conditions are constant between any two grid points in the landscape (but may vary between grid points pairs based upon local conditions or direction of travel).  Burning period duration is on the order of several minutes.

- A *FireFly* is a sprite that has a specific grid point as its destination.


## Rules

- Every FireFly is *spawned* at some grid point.

- A FireFly is assigned its fixed destination grid point when it is spawned.

- A FireFly travels in a straight line towards its destination grid point.

- A FireFly may require 1 or more burning periods to reach its destination grid point.

- A FireFly's travel velocity may vary between burning periods.

- A FireFly's travel velocity may vary as it passes through grid point spheres of influence.

- Many FireFlys may be assigned the same destination grid point, so a grid point may have many FireFlys heading towards it from various locations and angles.

- The first FireFly to reach the destination grid point 'wins'.

- The 'winning' FireFly spawns a swarm of new FireFlys, the 'non-winning' FireFlys go to FireFly Purgatory where they wait to be reborn.

---

# Period Processing

- for every grid point in the destination grid point store ...
  - if the grid point's arrival time is less than the current period's begin time
    - add the grid point to burned grid points store
    - move all the grid point's FireFlys to the FireFly recycle store
    - remove the grid point from the destination grid point store

- for every grid point in the destination grid point store ...
  - for every FireFly with this destination grid point ...
    - set FireFly remaining travel time to the burning period duration
    - while FireFly has travel time remaining ...
      - determine 'step distance'
        - if FireFly is in its destination cell:
          - set 'step distance' from current position to grid point (cell center)
        - otherwise the FireFly is not in its destination cell:
          - determine idx of next cell to be traversed by the FireFly
          - if the next cell is unburnable:
            - move FireFly from the destination cell FireFly list to the recycle bin
            - continue with the next FireFly
          - set 'step distance' from current position to next cell boundary traversal point
      - determine FireFly velocity at its current position, time, and direction
      - determine time for FireFly to travel the 'step distance'
      - if FireFly has insufficient travel time to travel the 'step distance':
        - update FireFly position for the remaining travel time and velocity
        - continue with the next FireFly

      - if FireFly is in its destination cell:
        - if arrival time is less than desination cell's current arrival time
          - set destination cell's arrival time to FireFly arrival time
      - subtract traversal time from FireFly's remaining travel time



---
## Class
```js
export class FireFly {
  constructor () {
    this._x // current location x coordinate
    this._y // current location y coordinate
    this._a // angle of travel
    this._v // velocity of travel
  }
}
```

---

## Flight Angles per Octant

Ther is an 8-way symmetry in the FireFly flight angles.  Each octant has 32 flight angles plus the shared border angles every 45 degrees:

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|------|------|------|------|-----|-----|-----|------|-----|------|-----|
| 10/0 | 10/1 | -/-  | 10/3 | -/- | -/- | -/- | 10/7 | -/- | 10/9 | -/- |
| 9/0  |  9/1 | 9/2  |  -/- | 9/4 | 9/5 | -/- |  9/7 | 9/8 |  -/- | |
| 8/0  |  8/1 | -/-  |  8/3 | -/- | 8/5 | -/- |  8/7 | -/- | | |
| 7/0  |  7/1 | 7/2  |  7/3 | 7/4 | 7/5 | 7/6 |  -/- | | | |
| 6/0  |  6/1 | -/-  |  -/- | -/- | 6/5 | -/- | | | | | |
| 5/0  |  5/1 | 5/2  |  5/3 | 5/4 | -/- | | | | | |
| 4/0  |  4/1 | -/-  |  4/3 | -/- | | | | | | |
| 3/0  |  3/1 | 3/2  |  -/- | | | | | | | |
| 2/0  |  2/1 | -/-  | | | | | | | | |
| 1/0  |  1/1 | | | | | | | | | |
| 0/0  | | | | | | | | | | |
