import { test, expect } from 'vitest'
import { getKvitt } from './getKvitt'

const deepStrictEqual = <A, B>(a: A, b: B) => {
  expect(a).toEqual(b)
}

test('simple case', () => {
  const output = getKvitt(['m', 'h'], [{ from: 'm', amount: 100 }])

  deepStrictEqual(output.initialBalance, {
    h: 50,
    m: -50,
  })
})

test('simple case', () => {
  const output = getKvitt(
    ['m', 'h'],
    [
      { from: 'm', amount: 100 },
      { from: 'h', amount: { m: 50 } },
    ],
  )
  deepStrictEqual(output.initialBalance, {
    h: 0,
    m: 0,
  })
})

test('splits wisely', () => {
  const output = getKvitt(
    ['m', 'h'],
    [
      { from: 'm', amount: 200 },
      { from: 'h', amount: 100 },
    ],
  )
  deepStrictEqual(output.initialBalance, { m: -50, h: 50 })
})

test('simple three way example', () => {
  const output = getKvitt(
    ['m', 'h', 's'],
    [
      {
        from: 'm',
        amount: 9,
      },
    ],
  )
  deepStrictEqual(output.initialBalance, {
    h: 3,
    m: -6,
    s: 3,
  })
  deepStrictEqual(output.paymentsForBalance, [
    { from: 'h', to: 'm', payment: 3 },
    {
      from: 's',
      to: 'm',
      payment: 3,
    },
  ])
})

test('three way example', () => {
  const output = getKvitt(
    ['m', 'h', 's'],
    [
      {
        from: 'm',
        amount: 7,
      },
      {
        from: 'h',
        amount: 2,
      },
    ],
  )
  deepStrictEqual(output.initialBalance, {
    h: 1.0000000000000004,
    m: -4,
    s: 3,
  })
  deepStrictEqual(output.paymentsForBalance, [
    {
      from: 's',
      to: 'm',
      payment: 3,
    },
    { from: 'h', to: 'm', payment: 1 },
  ])
})

test('real world test', () => {
  const simpleExample = {
    t: 150,
    k: 150,
    ki: 600,
    h: 242.5 + 88,
    m: 242.5 + 88,
    s: 650,
    a: 595,
    j: 595,
    al: 0,
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
      from: 'al',
      payment: 309.9,
      to: 's',
    },
    {
      from: 'mgk',
      payment: 259.9,
      to: 'ki',
    },
    {
      from: 't',
      payment: 190.1,
      to: 'a',
    },
    {
      from: 'k',
      payment: 190.1,
      to: 'j',
    },
    {
      from: 'mgk',
      payment: 64.79999999999998,
      to: 'a',
    },
    {
      from: 'al',
      payment: 30.200000000000045,
      to: 'j',
    },
    {
      from: 'mgk',
      payment: 15.400000000000063,
      to: 'j',
    },
    {
      from: 'h',
      payment: 9.600000000000023,
      to: 'j',
    },
    {
      from: 'm',
      payment: 9.599999999999852,
      to: 'j',
    },
  ])
})
