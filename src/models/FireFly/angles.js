/* eslint-disable indent */
/* eslint-disable no-multi-spaces */
/* eslint-disable space-infix-ops */
/*
10/0 10/1  -/- 10/3  -/-  -/-  -/- 10/7  -/- 10/9 -/-
 9/0  9/1  9/2  -/-  9/4  9/5  -/-  9/7  9/8  -/-
 8/0  8/1  -/-  8/3  -/-  8/5  -/-  8/7  -/-
 7/0  7/1  7/2  7/3  7/4  7/5  7/6  -/-
 6/0  6/1  -/-  -/-  -/-  6/5  -/-
 5/0  5/1  5/2  5/3  5/4  -/-
 4/0  4/1  -/-  4/3  -/-
 3/0  3/1  3/2  -/-
 2/0  2/1  -/-
 1/0  1/1
 0/0
 -1/0 -1/1
 -2/0 -2/1  -/-
 -3/0 -3/1 -3/2  -/-
 -4/0 -4/1  -/- -4/3  -/-

 There are 31 vectors within each 45-degree octant
 PLUS the shared vectors every 45-degrees
*/
/**
 * Each element is [delta-y, delta-x] offset that produces a unique azimuth
 * within an octant
 */
export const Octant = [
  [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1],
  [3, 2],                         [5, 2],         [7, 2],         [9, 2],
  [4, 3],                         [5, 3],         [7, 3], [8, 3],         [10, 3],
                                  [5, 4],         [7, 4],         [9, 4],
                                          [6, 5], [7, 5], [8, 5], [9, 5],
                                                  [7, 6],
                                                          [8, 7], [9, 7], [10, 7],
                                                                  [9, 8],
                                                                          [10, 9]
]

// Returns array of [x, y] offsets of all destination points
export function destinations () {
  // Start with the shared octant boundary vectors at each 45-degree angle
  const dest = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
  Octant.forEach(([y, x]) => {
    dest.push([x, y]); dest.push([y, x])
    dest.push([x, -y]); dest.push([-y, x])
    dest.push([-x, y]); dest.push([y, -x])
    dest.push([-x, -y]); dest.push([-y, -x])
  })
  return dest
}
