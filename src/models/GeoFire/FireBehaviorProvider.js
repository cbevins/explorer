/**
 * Determines all fire behavior variables required by GeoFireGrid and IgnitionGrid
 */
import { FireBehaviorProviderInterface } from '../FireBehavior/FireBehaviorProviderInterface.js'

export class FireBehaviorProvider extends FireBehaviorProviderInterface {
  /**
   * Selects the outputs and sets the fire behavior simulator configuration
   */
  constructor () {
    super()
    const dag = this.dag()
    dag.select([
      dag.node('surface.fire.ellipse.axis.lengthToWidthRatio'),
      dag.node('surface.fire.ellipse.back.spreadDistance'),
      dag.node('surface.fire.ellipse.back.spreadRate'),
      dag.node('surface.fire.ellipse.head.spreadDistance'),
      dag.node('surface.fire.ellipse.head.spreadRate'),
      dag.node('surface.fire.ellipse.heading.fromNorth'),
      dag.node('surface.fire.ellipse.heading.fromUpslope'),
      dag.node('surface.fire.ellipse.flank.spreadDistance'),
      dag.node('surface.fire.ellipse.flank.spreadRate'),
      dag.node('surface.fire.ellipse.size.area'),
      dag.node('surface.fire.ellipse.size.perimeter'),
      dag.node('surface.fire.ellipse.size.length'),
      dag.node('surface.fire.ellipse.size.width')
    ])
    dag.configure([
      ['configure.fuel.primary', 'catalog'],
      ['configure.fuel.secondary', 'none'],
      ['configure.fuel.moisture', 'individual'],
      ['configure.fuel.curedHerbFraction', 'input'],
      ['configure.wind.speed', 'atMidflame'],
      ['configure.wind.direction', 'sourceFromNorth'],
      ['configure.slope.steepness', 'ratio']
    ])
  }

  // Black box that returns required fire behavior from the provided input
  getFireBehavior (input) {
    this._dag.input([
      ['surface.primary.fuel.model.catalogKey', [input.fuelModel]],
      ['surface.primary.fuel.model.behave.parms.cured.herb.fraction', [input.curedHerb]],
      ['site.moisture.dead.tl1h', [input.dead1]],
      ['site.moisture.dead.tl10h', [input.dead10]],
      ['site.moisture.dead.tl100h', [input.dead100]],
      ['site.moisture.live.herb', [input.liveHerb]],
      ['site.moisture.live.stem', [input.liveStem]],
      ['site.slope.direction.aspect', [input.aspect]],
      ['site.slope.steepness.ratio', [input.slope]],
      ['site.wind.direction.source.fromNorth', [input.windFrom]],
      ['site.wind.speed.atMidflame', [input.windSpeed]],
      ['site.fire.time.sinceIgnition', [input.duration]]
    ]).run()

    return {
      lwr: this._dag.node('surface.fire.ellipse.axis.lengthToWidthRatio').value(),
      backDist: this._dag.node('surface.fire.ellipse.back.spreadDistance').value(),
      backRos: this._dag.node('surface.fire.ellipse.back.spreadRate').value(),
      flankDist: this._dag.node('surface.fire.ellipse.flank.spreadDistance').value(),
      flankRos: this._dag.node('surface.fire.ellipse.flank.spreadRate').value(),
      headDist: this._dag.node('surface.fire.ellipse.head.spreadDistance').value(),
      headRos: this._dag.node('surface.fire.ellipse.head.spreadRate').value(),
      heading: this._dag.node('surface.fire.ellipse.heading.fromNorth').value(),
      headingUp: this._dag.node('surface.fire.ellipse.heading.fromUpslope').value(),
      area: this._dag.node('surface.fire.ellipse.size.area').value(),
      perimeter: this._dag.node('surface.fire.ellipse.size.perimeter').value(),
      length: this._dag.node('surface.fire.ellipse.size.length').value(),
      width: this._dag.node('surface.fire.ellipse.size.width').value(),
      input: input
    }
  }
}
