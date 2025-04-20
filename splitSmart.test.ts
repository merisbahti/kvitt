import * as R from 'remeda'
import {test, expect} from 'bun:test'

type Database = Array<{ from: string, to: string, payment: number }>;

const getBalance = (database: Database): Record<string, number | undefined> => {
    return database.reduce((acc, {from, to, payment}) => ({
        ...acc,
        [from]: (acc[from] ?? 0) - payment,
        [to]: (acc[to] ?? 0) + payment
    }), {} as Record<string, number | undefined>)
}


const splitPayments = (people: Array<string>, initialPayments: Array<{
    from: string,
    amount: number | Record<string, number>
}>): {
    initialBalance: Record<string, number | undefined>,
    paymentsForBalance: Database
} => {
    const database: Database = initialPayments.flatMap(({amount, from}) => {
        if (typeof amount === 'number') {
            return people.filter(x => x !== from).map(to => ({
                from,
                to,
                payment: amount / people.length
            }))
        }
        return Object.entries(amount).map(([to, payment]) => ({
            from, to, payment
        }))
    })
    const initialBalance = getBalance(database)

    const paymentsForBalance: Database = []


    return {initialBalance, paymentsForBalance}
}

test('simple case', () => {
    const output = splitPayments(
        ['meris', 'henrietta'],
        [
            {from: 'meris', amount: 100},
        ])
    expect(output.initialBalance).toStrictEqual({
            henrietta: 50,
            meris: -50,
        }
    )


})


test('simple case', () => {
    const output = splitPayments(
        ['meris', 'henrietta'],
        [
            {from: 'meris', amount: 100},
            {from: 'henrietta', amount: {meris: 50}},
        ])
    expect(output.initialBalance).toStrictEqual({
            henrietta: 0,
            meris: 0,
        }
    )


})


test('splits wisely', () => {
    const output = splitPayments(
        ['meris', 'henrietta'],
        [
            {from: 'meris', amount: 200},
            {from: 'henrietta', amount: 100},
        ])
    expect(output.initialBalance).toEqual({meris: -50, henrietta: 50})


})

test('three way example', () => {
    const simpleExample = {
        'meris': 7,
        'henrietta': 2,
        'sara': 0
    }


    const output = splitPayments(['meris', 'henrietta', 'sara'], [{from: 'meris', amount: 7}, {
        from: 'henrietta',
        amount: 2
    }])
    expect(output.initialBalance).toEqual({})
})

test.skip('real world test', () => {
    const simpleExample = {
        "tommy": 150,
        "karin": 150,
        "kina": 600,
        "henrietta": 242.5 + 88,
        "meris": 242.5 + 88,
        "sara": 450,
        "anna": 595,
        "jens": 595,
        "alex": 0,
    }
    const output = splitPayments(simpleExample)
    expect(output.averageCost).toEqual(355.6666666666667)
    expect(output.debtsFrom).toEqual({})
})
