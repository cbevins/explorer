/**
 * FireInputProvider is a black box called by GeoFireGrid
 * to get the necessary fire behavior inputs at point [x, y] at time t.
 */
import { FireInputProvider } from './FireInputProvider.js'

export class FireInputProviderMock extends FireInputProvider {
  getFireInput (x, y, t) {
    return {
      x: x,
      y: y,
      t: t,
      fuelModel: '124',
      curedHerb: 0.778,
      dead1: 0.05,
      dead10: 0.07,
      dead100: 0.09,
      duration: 1,
      liveHerb: 0.5,
      liveStem: 1.5,
      slope: 0.25,
      aspect: 180,
      windFrom: 315,
      windSpeed: 10 * 88
    }
  }
}
