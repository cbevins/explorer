/* eslint-disable jest/prefer-to-have-length */
import { FireMeshIgnitionEllipseProvider } from './FireMeshIgnitionEllipseProvider.js'
import { FireMeshBehaviorProviderEllipse } from './FireMeshBehaviorProviderEllipse.js'
import { FireMeshInputProviderConstant } from './FireMeshInputProviderConstant.js'
import { expect } from '@jest/globals'

const fireBehaviorProvider = new FireMeshBehaviorProviderEllipse()
const fireInputProvider = new FireMeshInputProviderConstant()

const x = 1
const y = 2
const time = 3
const duration = 4
const spacing = 5

test('1: FireMeshIgnitionEllipseProvider constructor()', () => {
  const provider = new FireMeshIgnitionEllipseProvider(fireInputProvider, fireBehaviorProvider)

  const input = fireInputProvider.getFireInput(x, y, time)
  expect(input.x).toEqual(x)
  expect(input.y).toEqual(y)
  expect(input.t).toEqual(time)
  expect(input.fuelModel).toEqual('124')

  const fire = fireBehaviorProvider.getFireBehavior(input)
  expect(fire.headRos).toEqual(50.38808570081844)
  expect(fire.length).toEqual(51.41395020532023)
  expect(fire.width).toEqual(14.37933914618663)

  const key = provider.cacheKey(input)
  expect(key).toEqual('124|0.778|0.05|0.07|0.09|0.50|1.50|0.25|315|315|880|1')
  expect(provider._cache.has(key)).toEqual(false)
  expect(provider._cache.size).toEqual(0)

  const ellipse1 = provider.ignitionEllipseAt(x, y, time, duration, spacing)
  expect(ellipse1.length()).toEqual(51.41395020532023 * duration)
  expect(provider._cache.size).toEqual(1)

  const ellipse2 = provider.ignitionEllipseAt(x, y, time, duration, spacing)
  expect(ellipse2).toEqual(ellipse1)
  expect(ellipse2.length()).toEqual(51.41395020532023 * duration)
  expect(provider._cache.size).toEqual(1)

  input.fuelModel = '1'
  const key2 = provider.cacheKey(input)
  expect(key2).toEqual('1|0.778|0.05|0.07|0.09|0.50|1.50|0.25|315|315|880|1')
  expect(provider._cache.has(key2)).toEqual(false)
  expect(provider._cache.size).toEqual(1)
})
