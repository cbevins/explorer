import { FireStatus } from './FireStatus.js'

// Returns an ASCII map string of the GeoFireGrid Unburnable, Unburned, and Burned points
export function geoFireGridMap (fg, title = '') {
  let str = `\n${title} at time ${fg.period().ends()}\n     `
  for (let col = 0; col < fg.cols(); col += 10) { str += `${(col / 10).toFixed(0).padEnd(10)}` }
  str += '\n     '
  for (let col = 0; col < fg.cols(); col += 10) { str += '0123456789' }
  str += '\n'
  fg.eachRow(y => {
    str += y.toFixed(0).padStart(4) + ' '
    fg.eachCol(x => {
      const status = fg.get(x, y)
      if (FireStatus.isUnburnable(status)) str += 'X'
      else if (FireStatus.isUnburnedAt(status, fg.period().ends())) str += '-'
      else str += '*'
    })
    str += '\n'
  })
  return str
}

// Returns an ASCII map string of the points burned during the pervious walk
// NOTE: MUST UNCOMMENT THE 2 STATEMENTS IN IgnitionGrid.js that create and update _burnMap
export function ignitionGridBurnMap (ig) {
  let str = `IgnitionGrid Burned Cell Map (${ig.cols()} cols by ${ig.rows()} rows)\n`
  for (let r = 0, idx = 0; r < ig.rows(); r++) {
    for (let c = 0; c < ig.cols(); c++) {
      str += ig._burnMap[idx++]
    }
    str += '\n'
  }
  return str
}

// Returns an ASCII map string of the IgnitionGrid point distances from the ignition point
export function ignitionGridDistanceMap (ig) {
  let str = `IgnitionGrid Distance Map (${ig.cols()} cols by ${ig.rows()} rows)\n`
  ig.eachRow(y => {
    ig.eachCol(x => { str += ig.get(x, y).dist.toFixed(0).padStart(3) })
    str += '\n'
  })
  return str
}

// Returns an ASCII map string of the IgnitionGrid point ignition times from the ignition point
export function ignitionGridTimeMap (ig) {
  let str = `IgnitionGrid Time Map (${ig.cols()} cols by ${ig.rows()} rows)\n`
  ig.eachRow(y => {
    ig.eachCol(x => { str += ig.get(x, y).time.toFixed(0).padStart(3) })
    str += '\n'
  })
  return str
}
