/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { FireMeshBehaviorProviderBetaNSEW } from './FireMeshBehaviorProviderBetaNSEW.js'

function log (title, fire) { console.log(title, fire) }

const Input = {
  x: 1500,
  y: 4500,
  t: 1,
  fuelModel: '124',
  curedHerb: 0.778,
  dead1: 0.05,
  dead10: 0.07,
  dead100: 0.09,
  liveHerb: 0.5,
  liveStem: 1.5,
  slope: 0.25,
  aspect: 315,
  windFrom: 315,
  windSpeed: 10 * 88
}

const fbp = new FireMeshBehaviorProviderBetaNSEW()
const dag = fbp.dag()

test('1: FireMeshBehaviorProvider input requirements', () => {
  // List input variables
  let str = '\n'
  const inputs = dag.requiredInputNodes()
  const keys = []
  inputs.forEach(node => {
    str += node.key() + '\n'
    keys.push(node.key())
  })
  // console.log(inputs.length, 'Required Input Variables', str)
  expect(inputs.length).toEqual(12)
  expect(keys).toContain('surface.primary.fuel.model.catalogKey')
  expect(keys).toContain('surface.primary.fuel.model.behave.parms.cured.herb.fraction')
  expect(keys).toContain('site.moisture.dead.tl1h')
  expect(keys).toContain('site.moisture.dead.tl10h')
  expect(keys).toContain('site.moisture.dead.tl100h')
  expect(keys).toContain('site.moisture.live.herb')
  expect(keys).toContain('site.moisture.live.stem')
  expect(keys).toContain('site.slope.direction.aspect')
  expect(keys).toContain('site.slope.steepness.ratio')
  expect(keys).toContain('site.wind.direction.source.fromNorth')
  expect(keys).toContain('site.wind.speed.atMidflame')
  expect(keys).toContain('site.fire.vector.fromNorth')
})

test('2: FireMeshBehaviorProvider no-wind, no-slope beta RoS', () => {
  const ros = 1.4333245773924832
  const input = { ...Input, slope: 0, windSpeed: 0 }
  const fire = fbp.getFireBehavior(input)
  expect(fire.ros.north).toEqual(ros)
  expect(fire.ros.east).toEqual(ros)
  expect(fire.ros.south).toEqual(ros)
  expect(fire.ros.west).toEqual(ros)
})

test('3: FireMeshBehaviorProvider North Wind-Aspect, heading South', () => {
  const input = { ...Input, aspect: 0, windFrom: 0 }
  const fire = fbp.getFireBehavior(input)
  // log('North Wind-Aspect', fire)
  expect(fire.ros.south).toBeCloseTo(50.38808570081844, 12)
  expect(fire.ros.west).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.north).toBeCloseTo(1.0258645045017885, 12)
  expect(fire.ros.east).toBeCloseTo(2.010790782028448, 12)
})

test('4: FireMeshBehaviorProvider East Wind-Aspect, heading West', () => {
  const input = { ...Input, aspect: 90, windFrom: 90 }
  const fire = fbp.getFireBehavior(input)
  // log('East Wind-Aspect', fire)
  expect(fire.ros.west).toBeCloseTo(50.38808570081844, 12)
  expect(fire.ros.south).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.east).toBeCloseTo(1.0258645045017885, 12)
  expect(fire.ros.north).toBeCloseTo(2.010790782028448, 12)
})

test('5: FireMeshBehaviorProvider South Wind-Aspect, heading North', () => {
  const input = { ...Input, aspect: 180, windFrom: 180 }
  const fire = fbp.getFireBehavior(input)
  // log('South Wind-Aspect', fire)
  expect(fire.ros.north).toBeCloseTo(50.38808570081844, 12)
  expect(fire.ros.east).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.south).toBeCloseTo(1.0258645045017885, 12)
  expect(fire.ros.west).toBeCloseTo(2.010790782028448, 12)
})

test('6: FireMeshBehaviorProvider West Wind-Aspect, heading East', () => {
  const input = { ...Input, aspect: 270, windFrom: 270 }
  const fire = fbp.getFireBehavior(input)
  // log('West Wind-Aspect', fire)
  expect(fire.ros.east).toBeCloseTo(50.38808570081844, 12)
  expect(fire.ros.southeast).toBeCloseTo(6.2619789019932, 12)
  expect(fire.ros.south).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.southwest).toBeCloseTo(1.1976913737873367, 12)
  expect(fire.ros.west).toBeCloseTo(1.0258645045017885, 12)
  expect(fire.ros.northwest).toBeCloseTo(1.1976913737873367, 12)
  expect(fire.ros.north).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.northeast).toBeCloseTo(6.2619789019932, 12)
})

test('7: FireMeshBehaviorProvider NorthWest Wind-Aspect, heading SouthEast', () => {
  const input = { ...Input, aspect: 315, windFrom: 315 }
  const fire = fbp.getFireBehavior(input)
  // log('West Wind-Aspect', fire)
  expect(fire.ros.east).toBeCloseTo(6.2619789019932, 12)
  expect(fire.ros.southeast).toBeCloseTo(50.38808570081844, 12)
  expect(fire.ros.south).toBeCloseTo(6.2619789019932, 12)
  expect(fire.ros.southwest).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.west).toBeCloseTo(1.1976913737873367, 12)
  expect(fire.ros.northwest).toBeCloseTo(1.0258645045017885, 12)
  expect(fire.ros.north).toBeCloseTo(1.1976913737873367, 12)
  expect(fire.ros.northeast).toBeCloseTo(2.010790782028448, 12)
})

test('8: FireMeshBehaviorProvider SouthEast Wind-Aspect, heading NorthWest', () => {
  const input = { ...Input, aspect: 135, windFrom: 135 }
  const fire = fbp.getFireBehavior(input)
  // log('West Wind-Aspect', fire)
  expect(fire.ros.west).toBeCloseTo(6.2619789019932, 12)
  expect(fire.ros.northwest).toBeCloseTo(50.38808570081844, 12)
  expect(fire.ros.north).toBeCloseTo(6.2619789019932, 12)
  expect(fire.ros.northeast).toBeCloseTo(2.010790782028448, 12)
  expect(fire.ros.east).toBeCloseTo(1.1976913737873367, 12)
  expect(fire.ros.southeast).toBeCloseTo(1.0258645045017885, 12)
  expect(fire.ros.south).toBeCloseTo(1.1976913737873367, 12)
  expect(fire.ros.southwest).toBeCloseTo(2.010790782028448, 12)
})
