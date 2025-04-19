import * as R from 'remeda'
import {test, expect} from 'bun:test'

const splitPayments = <Keys extends string>(contributions: Record<Keys, number>): {
    averageCost: number,
    diffs: Record<Keys, number>,
    debtsFrom: Record<Keys, Partial<Record<Keys, number>>>
} => {

    const averageCost = R.pipe(
        contributions,
        R.values,
        R.sum(),
        (n) => R.divide(n, R.length(R.keys(contributions)))
    )

    const diffs = R.pipe(
        contributions,
        R.mapValues((value) => averageCost - value)
    ) as unknown as Record<Keys, number>

    type DebtValue = Partial<Record<Keys, number>>
    const debtsFrom = Object.fromEntries(Object.keys(contributions).map(x => [x, {}] as const)) as unknown as { [key in Keys]: DebtValue }
    const getBalanceFor = (name: Keys) => {
        const diff = diffs[name] // negative means they owe money


        const debtsForName = R.sum(R.values(Object.values(debtsFrom[name]) as DebtValue) as number[])

        return diff + debtsForName // this is the balance for the name, we want it to be 0
    }


    for (const [payer, totalToPay] of R.entries.strict(diffs)) {
        for (const [borrower, initial] of R.entries.strict(debtsFrom)) {
            const payerBalance = getBalanceFor(payer)
            if (payerBalance >= 0) {
                continue
            }

            const borrowerBalance = getBalanceFor(borrower)

            if (borrowerBalance <= 0) {
                continue
            }

            const amountToPay = Math.min(-payerBalance, borrowerBalance)
            debtsFrom[payer] = {...debtsFrom[payer], [borrower]: amountToPay}
        }

    }


    return {averageCost, diffs, debtsFrom}
}


test('splits wisely', () => {
    const simpleExample = {
        'meris': 300,
        'henrietta': 150
    }
    const output = splitPayments(simpleExample)
    expect(output.averageCost).toEqual(225)
    expect(output.diffs.henrietta).toEqual(75)
    expect(output.diffs.meris).toEqual(-75)
    expect(output.debtsFrom.meris).toEqual({henrietta: 75})
    expect(output.debtsFrom.henrietta).toEqual({})

})

test('three way example', () => {
    const simpleExample = {
        'meris': 7,
        'henrietta': 2,
        'sara': 0
    }
    const output = splitPayments(simpleExample)
    expect(output.averageCost).toEqual(3)
    expect(output.diffs.henrietta).toEqual(1)
    expect(output.diffs.meris).toEqual(-4)
    expect(output.diffs.sara).toEqual(3)
    expect(output.debtsFrom).toEqual({
        'meris': {henrietta: 1, sara: 3},
        'henrietta': {},
        'sara': {}
    })
})

