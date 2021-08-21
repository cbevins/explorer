/* eslint-disable brace-style */
import { FireStatus } from '../../models/GeoFire'

// Updates the GeoFireGrid display
export function drawFireGrid (ctx, fireGrid) {
  ctx.lineWidth = 1
  let current = 0
  let previous = 0
  let unburnable = 0
  let unburned = 0
  const { west, north, east, south, xSpacing, ySpacing } = fireGrid.bounds().props()
  for (let y = north, row = 0; y >= south; y -= ySpacing, row++) {
    for (let x = west, col = 0; x <= east; x += xSpacing, col++) {
      const status = fireGrid.status(x, y)
      if (FireStatus.isUnburnable(status)) {
        unburnable++
        ctx.fillStyle = 'black' // unburnable
      }
      // previously burned
      else if (FireStatus.isBurnedAt(status, fireGrid.period().begins())) {
        previous++
        ctx.fillStyle = 'red'
      }
      // ignited during this period
      else if (FireStatus.isBurnedAt(status, fireGrid.period().ends())) {
        current++
        ctx.fillStyle = 'yellow'
      }
      // unburned at end of this period
      else {
        unburned++
        ctx.fillStyle = 'green' // unburned at end of period
      }
      ctx.fillRect(col * xSpacing, row * ySpacing, xSpacing, ySpacing)
    }
  }

  const summary = [
    ['Period Number', fireGrid.period().number()],
    ['Period Begins', fireGrid.period().begins()],
    ['Period Ends', fireGrid.period().ends()],
    ['Ignition Points', fireGrid.ignitionPoints()],
    ['Newly Burned', current],
    ['Previously Burned', previous],
    ['Total Burned', current + previous],
    ['Unburned', unburned],
    ['Unburnable', unburnable]
  ]

  return { done: (unburned === 0 || fireGrid.ignitionPoints() === 0), summary: summary }
}
