import { FireBehaviorProviderInterface } from '../FireBehavior/FireBehaviorProviderInterface.js'
import { Sim, StorageNodeMap } from '../FireBehavior/fire-behavior-simulator.js'

export class FireMeshBehaviorProviderBetaNSEW extends FireBehaviorProviderInterface {
  constructor () {
    super()
    const sim = new Sim()
    const dag = sim.createDag('FireMesh')
    dag.select([
      dag.node('surface.fire.ellipse.axis.lengthToWidthRatio'),
      dag.node('surface.fire.ellipse.beta.spreadRate'),
      dag.node('surface.fire.ellipse.back.spreadRate'),
      dag.node('surface.fire.ellipse.head.spreadRate'),
      dag.node('surface.fire.ellipse.heading.fromNorth'),
      dag.node('surface.fire.ellipse.heading.fromUpslope'),
      dag.node('surface.fire.ellipse.flank.spreadRate'),
      dag.node('surface.fire.ellipse.vector.fromHead'),
      dag.node('surface.fire.ellipse.vector.fromNorth'),
      dag.node('surface.fire.ellipse.vector.fromUpslope')
    ])
    dag.configure([
      ['configure.fire.vector', 'fromNorth'],
      ['configure.fuel.primary', 'catalog'],
      ['configure.fuel.secondary', 'none'],
      ['configure.fuel.moisture', 'individual'],
      ['configure.fuel.curedHerbFraction', 'input'],
      ['configure.wind.speed', 'atMidflame'],
      ['configure.wind.direction', 'sourceFromNorth'],
      ['configure.slope.steepness', 'ratio']
    ])
    this._store = new StorageNodeMap(dag)
    dag.setStorageClass(this._store)
    this._dag = dag
  }

  dag () { return this._dag }

  // Black box that returns required fire behavior at some point at some time
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
      ['site.fire.vector.fromNorth', [0, 45, 90, 135, 180, 225, 270, 315]]
    ]).run()

    const fire = {
      lwr: this._dag.node('surface.fire.ellipse.axis.lengthToWidthRatio').value(),
      ros: {
        backing: this._dag.node('surface.fire.ellipse.back.spreadRate').value(),
        north: this._store.get('surface.fire.ellipse.beta.spreadRate', 0),
        northeast: this._store.get('surface.fire.ellipse.beta.spreadRate', 1),
        east: this._store.get('surface.fire.ellipse.beta.spreadRate', 2),
        southeast: this._store.get('surface.fire.ellipse.beta.spreadRate', 3),
        south: this._store.get('surface.fire.ellipse.beta.spreadRate', 4),
        southwest: this._store.get('surface.fire.ellipse.beta.spreadRate', 5),
        west: this._store.get('surface.fire.ellipse.beta.spreadRate', 6),
        northwest: this._store.get('surface.fire.ellipse.beta.spreadRate', 7),
        flanking: this._dag.node('surface.fire.ellipse.flank.spreadRate').value(),
        heading: this._dag.node('surface.fire.ellipse.head.spreadRate').value()
      },
      heading: {
        fromNorth: this._dag.node('surface.fire.ellipse.heading.fromNorth').value(),
        fromUpslope: this._dag.node('surface.fire.ellipse.heading.fromUpslope').value()
      },
      input: input
    }
    return fire
  }
}
