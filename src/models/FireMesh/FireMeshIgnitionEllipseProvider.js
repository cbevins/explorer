import { FireMeshEllipse } from './FireMeshEllipse.js'

export class FireMeshIgnitionEllipseProvider {
  /**
   * @param {FireMesh} fireMesh
   * @param {FireInputProviderInterface} fireInputProvider
   * @param {FireBehaviorProviderInterface} fireBehaviorProvider
   */
  constructor (fireInputProvider, fireBehaviorProvider) {
    this._cache = new Map()
    this._fireBehaviorProvider = fireBehaviorProvider
    this._fireInputProvider = fireInputProvider
  }

  cacheKey (input) {
    let key = `${input.fuelModel}|${input.curedHerb.toFixed(3)}|`
    key += `${input.dead1.toFixed(2)}|${input.dead10.toFixed(2)}|${input.dead100.toFixed(2)}|`
    key += `${input.liveHerb.toFixed(2)}|${input.liveStem.toFixed(2)}|`
    key += `${input.slope.toFixed(2)}|${input.aspect.toFixed(0)}|`
    key += `${input.windFrom.toFixed(0)}|${input.windSpeed.toFixed(0)}|${input.duration.toFixed(0)}`
    return key
  }

  ignitionEllipseAt (x, y, time, duration, spacing) {
    // Request the fire behavior inputs at [x, y] and time
    const input = this._fireInputProvider.getFireInput(x, y, time, duration)

    // Convert the fire behavior inputs into a cache key
    const key = this.cacheKey(input)

    // If the cache contains an ellipse with this key, return its reference
    if (this._cache.has(key)) return this._cache.get(key)

    // Otherwise create a new FireMeshEllipse
    const fire = this._fireBehaviorProvider.getFireBehavior(input)
    const ellipse = new FireMeshEllipse(fire.length, fire.width, fire.heading, duration, spacing)

    // HACK to add fire behavior and input to the new ellipse
    ellipse._fire = fire

    // Add the new FireMeshEllipse to the cache
    this._cache.set(key, ellipse)
    return ellipse
  }
}
