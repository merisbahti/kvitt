import { expect, test } from "bun:test";

type Database = Array<{ from: string; to: string; payment: number }>;

const getBalance = (database: Database): Record<string, number | undefined> => {
  return database.reduce(
    (acc, { from, to, payment }) => ({
      ...acc,
      [from]: (acc[from] ?? 0) - payment,
      [to]: (acc[to] ?? 0) + payment,
    }),
    {} as Record<string, number | undefined>,
  );
};

const splitPayments = (
  people: Array<string>,
  initialPayments: Array<{
    from: string;
    amount: number | Record<string, number>;
  }>,
): {
  initialBalance: Record<string, number | undefined>;
  paymentsForBalance: Database;
} => {
  const database: Database = initialPayments.flatMap(({ amount, from }) => {
    if (typeof amount === "number") {
      return people
        .filter((x) => x !== from)
        .map((to) => ({
          from,
          to,
          payment: amount / people.length,
        }));
    }
    return Object.entries(amount).map(([to, payment]) => ({
      from,
      to,
      payment,
    }));
  });

  const initialBalance = getBalance(database);

  const paymentsForBalance: Database = [];

  let currentBalance = { ...initialBalance };
  let attemptsLeft = people.length * people.length;

  while (
    Object.values(currentBalance).some((x) => x !== 0) &&
    attemptsLeft > 0
  ) {
    attemptsLeft--;

    // find min and max

    const extremes = Object.entries(currentBalance).reduce(
      (acc, tuple) => {
        const [name, value] = tuple as [string, number];
        if (value === 0) {
          return acc;
        }
        const max =
          !acc.max || value > acc.max.value ? { person: name, value } : acc.max;
        const min =
          !acc.min || value < acc.min.value ? { person: name, value } : acc.min;
        return { min, max };
      },
      { min: null, max: null } as {
        min: { person: string; value: number } | null;
        max: { person: string; value: number } | null;
      },
    );

    if (
      !extremes.min ||
      !extremes.max ||
      extremes.max.person === extremes.min.person
    ) {
      break;
    }

    paymentsForBalance.push({
      from: extremes.max.person,
      to: extremes.min.person,
      payment: Math.min(
        Math.abs(extremes.min.value),
        Math.abs(extremes.max.value),
      ),
    });
    currentBalance = getBalance([...database, ...paymentsForBalance]);
  }

  return { initialBalance, paymentsForBalance };
};

test("simple case", () => {
  const output = splitPayments(
    ["meris", "henrietta"],
    [{ from: "meris", amount: 100 }],
  );
  expect(output.initialBalance).toStrictEqual({
    henrietta: 50,
    meris: -50,
  });
});

test("simple case", () => {
  const output = splitPayments(
    ["meris", "henrietta"],
    [
      { from: "meris", amount: 100 },
      { from: "henrietta", amount: { meris: 50 } },
    ],
  );
  expect(output.initialBalance).toStrictEqual({
    henrietta: 0,
    meris: 0,
  });
});

test("splits wisely", () => {
  const output = splitPayments(
    ["meris", "henrietta"],
    [
      { from: "meris", amount: 200 },
      { from: "henrietta", amount: 100 },
    ],
  );
  expect(output.initialBalance).toEqual({ meris: -50, henrietta: 50 });
});

test("simple three way example", () => {
  const output = splitPayments(
    ["meris", "henrietta", "sara"],
    [
      {
        from: "meris",
        amount: 9,
      },
    ],
  );
  expect(output.initialBalance).toEqual({
    henrietta: 3,
    meris: -6,
    sara: 3,
  });
  expect(output.paymentsForBalance).toEqual([
    { from: "henrietta", to: "meris", payment: 3 },
    {
      from: "sara",
      to: "meris",
      payment: 3,
    },
  ]);
});

test("three way example", () => {
  const output = splitPayments(
    ["meris", "henrietta", "sara"],
    [
      {
        from: "meris",
        amount: 7,
      },
      {
        from: "henrietta",
        amount: 2,
      },
    ],
  );
  expect(output.initialBalance).toEqual({
    henrietta: 1.0000000000000004,
    meris: -4,
    sara: 3,
  });
  expect(output.paymentsForBalance).toEqual([
    {
      from: "sara",
      to: "meris",
      payment: 3,
    },
    { from: "henrietta", to: "meris", payment: 1 },
  ]);
});

test("real world test", () => {
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
  };
  const total = Object.values(simpleExample).reduce((acc, x) => acc + x, 0);
  const average = total / Object.keys(simpleExample).length;
  const output = splitPayments(
    Object.keys(simpleExample),
    Object.entries(simpleExample).map(([from, amount]) => ({ from, amount })),
  );
  expect(total).toBe(3401);
  expect(average).toBe(340.1);
  // expect(output.initialBalance).toEqual({
  //   alex: 355.66666666666663,
  //   anna: -239.33333333333334,
  //   henrietta: 25.166666666666657,
  //   jens: -239.33333333333337,
  //   karin: 205.66666666666666,
  //   kina: -244.33333333333346,
  //   meris: 25.166666666666657,
  //   sara: -94.33333333333331,
  //   tommy: 205.66666666666666,
  // });

  expect(output.paymentsForBalance).toEqual([]);
});
