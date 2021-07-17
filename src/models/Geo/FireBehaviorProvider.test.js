import { FireBehaviorProvider } from './FireBehaviorProvider.js'
import { FireInputProvider } from './FireInputProvider.js'

test('1: FireBehaviorProvider constructor', () => {
  const fireBehaviorProvider = new FireBehaviorProvider()
  const dag = fireBehaviorProvider.dag()
  let str = 'FireBehaviorProvider requires the following inputs:\n'
  dag.requiredInputNodes().forEach(node => { str += `${node.key()}\n` })
  console.log(str)

  const fireInputProvider = new FireInputProvider()
  const input = fireInputProvider.getFireInput(1, 2, 3)
  expect(input.fuelModel).toEqual('124')

  const fire = fireBehaviorProvider.getFireBehavior(input)
  console.log('FireBehaviorProvider.fireBehavior() returns the following object:', fire)
})
