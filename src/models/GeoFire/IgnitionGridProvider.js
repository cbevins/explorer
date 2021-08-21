/**
 * A cache of IgnitionGrid instances, which are differentiated by 4 properties of
 * heading spread rate, length-to-width ratio, heading degrees, and duration.
 */
import { FireBehaviorProvider } from './FireBehaviorProvider.js'
import { createFireEllipse } from '../FireEllipse'
import { IgnitionGrid } from './IgnitionGrid.js'

export class IgnitionGridProvider {
  constructor () {
    this._fireBehaviorProvider = new FireBehaviorProvider()
    this._map = new Map()
  }

  createIgnitionGrid (fireGrid, fireInput, key) {
    const fire = this._fireBehaviorProvider.getFireBehavior(fireInput)
    // console.log('Fire Behavior at this point and time is', fire)
    const fireEllipse = createFireEllipse(fire.headRos, fire.lwr, fire.heading, fire.input.duration)
    const ignGrid = new IgnitionGrid(fireGrid, fireEllipse)
    this._map.set(key, ignGrid)
    return ignGrid
  }

  getIgnitionGrid (fireGrid, fireInput) {
    const key = this.gridKey(fireInput)
    if (this.hasGrid(key)) return this.getGrid(key)
    return this.createIgnitionGrid(fireGrid, fireInput, key)
  }

  getGrid (key) { return this._map.get(key) }

  gridKey (input) {
    let key = `${input.fuelModel}|${input.curedHerb.toFixed(3)}|`
    key += `${input.dead1.toFixed(2)}|${input.dead10.toFixed(2)}|${input.dead100.toFixed(2)}|`
    key += `${input.liveHerb.toFixed(2)}|${input.liveStem.toFixed(2)}|`
    key += `${input.slope.toFixed(2)}|${input.aspect.toFixed(0)}|`
    key += `${input.windFrom.toFixed(0)}|${input.windSpeed.toFixed(0)}|${input.duration.toFixed(0)}`
    return key
  }

  hasGrid (key) { return this._map.has(key) }
}
