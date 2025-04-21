import { deepStrictEqual } from 'node:assert'
import { test } from 'node:test'
import { getKvitt } from './getKvitt.ts'

test('simple case', () => {
  const output = getKvitt(['meris', 'henrietta'], [{ from: 'meris', amount: 100 }])

  deepStrictEqual(output.initialBalance, {
    henrietta: 50,
    meris: -50,
  })
})

test('simple case', () => {
  const output = getKvitt(
    ['meris', 'henrietta'],
    [
      { from: 'meris', amount: 100 },
      { from: 'henrietta', amount: { meris: 50 } },
    ],
  )
  deepStrictEqual(output.initialBalance, {
    henrietta: 0,
    meris: 0,
  })
})

test('splits wisely', () => {
  const output = getKvitt(
    ['meris', 'henrietta'],
    [
      { from: 'meris', amount: 200 },
      { from: 'henrietta', amount: 100 },
    ],
  )
  deepStrictEqual(output.initialBalance, { meris: -50, henrietta: 50 })
})

test('simple three way example', () => {
  const output = getKvitt(
    ['meris', 'henrietta', 'sara'],
    [
      {
        from: 'meris',
        amount: 9,
      },
    ],
  )
  deepStrictEqual(output.initialBalance, {
    henrietta: 3,
    meris: -6,
    sara: 3,
  })
  deepStrictEqual(output.paymentsForBalance, [
    { from: 'henrietta', to: 'meris', payment: 3 },
    {
      from: 'sara',
      to: 'meris',
      payment: 3,
    },
  ])
})

test('three way example', () => {
  const output = getKvitt(
    ['meris', 'henrietta', 'sara'],
    [
      {
        from: 'meris',
        amount: 7,
      },
      {
        from: 'henrietta',
        amount: 2,
      },
    ],
  )
  deepStrictEqual(output.initialBalance, {
    henrietta: 1.0000000000000004,
    meris: -4,
    sara: 3,
  })
  deepStrictEqual(output.paymentsForBalance, [
    {
      from: 'sara',
      to: 'meris',
      payment: 3,
    },
    { from: 'henrietta', to: 'meris', payment: 1 },
  ])
})

test('real world test', () => {
  const simpleExample = {
    tommy: 150,
    karin: 150,
    kina: 600,
    henrietta: 242.5 + 88,
    meris: 242.5 + 88,
    sara: 650,
    anna: 595,
    jens: 595,
    alex: 0,
    mgk: 0,
  }
  const total = Object.values(simpleExample).reduce((acc, x) => acc + x, 0)
  const average = total / Object.keys(simpleExample).length
  const output = getKvitt(
    Object.keys(simpleExample),
    Object.entries(simpleExample).map(([from, amount]) => ({ from, amount })),
  )
  deepStrictEqual(total, 3401)
  deepStrictEqual(average, 340.1)
  deepStrictEqual(output.paymentsForBalance, [
    {
      from: 'alex',
      payment: 309.9,
      to: 'sara',
    },
    {
      from: 'mgk',
      payment: 259.9,
      to: 'kina',
    },
    {
      from: 'tommy',
      payment: 190.1,
      to: 'anna',
    },
    {
      from: 'karin',
      payment: 190.1,
      to: 'jens',
    },
    {
      from: 'mgk',
      payment: 64.79999999999998,
      to: 'anna',
    },
    {
      from: 'alex',
      payment: 30.200000000000045,
      to: 'jens',
    },
    {
      from: 'mgk',
      payment: 15.400000000000063,
      to: 'jens',
    },
    {
      from: 'henrietta',
      payment: 9.600000000000023,
      to: 'jens',
    },
    {
      from: 'meris',
      payment: 9.599999999999852,
      to: 'jens',
    },
  ])
})
