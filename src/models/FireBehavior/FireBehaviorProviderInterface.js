/**
 * Defines the interface that must be supported by a FireBehaviorProvider.
 *
 * FireBehaviorProviderInterface requires a single method:
 *  getFireBehavior(fireInputObject)
 * which returns an object of all the fire behavior results expected by the client.
 */
import { Sim } from './fire-behavior-simulator.js'

export class FireBehaviorProviderInterface {
  constructor (dagName = 'FireBehaviorProvider') {
    this._sim = new Sim()
    this._dag = this._sim.createDag(dagName)
    // In their constructors, derived classes should:
    // 1: select the required output nodes
    //  - dag.select([...])
    // 2: configure the input options
    //  - dag.configure([...])
  }

  dag () { return this._dag }

  /**
   * Must be reimplemented by all derived classes and perform the following tasks:
   * 1: set the Dag input values from the*input* object
   *    this._dag.input([])
   * 2: run
   *    this._dag.run()
   * 3: return results in an object
   *    return {
   *      headRos: this._dag.node('surface.fire.ellipse.head.spreadRate').value(),
   *      heading: this._dag.node('surface.fire.ellipse.heading.fromNorth').value()
   *    }
   *
   * @param {object} input Object containing all the required input values
   * @return {object} Results as selected and configured within the derived class' constructor
   */
  getFireBehavior (input) {
    throw new Error('FireBehaviorProviderInterface.getFireBehavior(inputObject) MUST be reimplimented by derived classes')
  }
}
