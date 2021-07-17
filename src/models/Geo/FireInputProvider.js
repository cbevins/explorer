/**
 * FireInputProvider is a black box called by GeoFireGrid
 * to get the necessary fire behavior inputs at point [x, y] at time t.
 *
 * It has a single method, getFireInput(x, y, t), which must return object:
      x: GeoCoord of fire conditions point of interest,
      y: GeoCoord of fire conditions point of interest,
      t: time of fire conditions of interest
      fuelModel: fuel model key
      curedHerb: ratio of cured herbs
      dead1: dead 1-h fuel moisture ratio
      dead10: dead 10-h fuel moisture ratio
      dead100: dead 100-h fuel moisture ratio
      duration: elapsed time since ignition
      liveHerb: live herbaceous fuel moisture ratio
      liveStem: live stemwood fuel moisture ratio
      slope: slope rise/reach ratio
      aspect: downslope azimuth in degrees clockwise from north
      windFrom: wind source azimuth in degrees clockwise from north
      windSpeed: midflame wind speed in feet per minute
    }
 */
export class FireInputProvider {
  getFireInput (x, y, t) {
    throw new Error('FireInputProvider.getFireInput(x, y, t) MUST be reimplimented by derived classes')
  }
}
