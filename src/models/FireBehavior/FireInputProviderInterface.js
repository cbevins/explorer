/**
 * FireInputProviderInterface is a simple interface for getting the fire behavior inputs
 * at a specific location and time.
 *
 * FireInputProviderInterface requires a single method
 *  - getFireInput(x, y, t)
 *
 * which must return an object with all the inputs required by the client FireBehaviorProvider.
 * The returned object will usually looks something like this:
 *  {
 *    x: GeoCoord of fire conditions point of interest,
 *    y: GeoCoord of fire conditions point of interest,
 *    t: time of fire conditions of interest
 *    fuelModel: fuel model key
 *    curedHerb: ratio of cured herbs
 *    dead1: dead 1-h fuel moisture ratio
 *    dead10: dead 10-h fuel moisture ratio
 *    dead100: dead 100-h fuel moisture ratio
 *    duration: elapsed time since ignition
 *    liveHerb: live herbaceous fuel moisture ratio
 *    liveStem: live stemwood fuel moisture ratio
 *    slope: slope rise/reach ratio
 *    aspect: downslope azimuth in degrees clockwise from north
 *    windFrom: wind source azimuth in degrees clockwise from north
 *    windSpeed: midflame wind speed in feet per minute
 *  }
 */

export class FireInputProviderInterface {
  getFireInput (x, y, t) {
    throw new Error('FireInputProviderInterface.getFireInput(x, y, t) MUST be reimplimented by derived classes')
  }
}
