export class FireBehaviorProviderInterface {
  getFireBehavior (input) {
    throw new Error('FireBehaviorProviderInterface.getFireBehavior(inputObject) MUST be reimplimented by derived classes')
  }
}
