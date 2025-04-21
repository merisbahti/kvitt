export type Database = Array<{ from: string; to: string; payment: number }>;

export const getBalance = (
  database: Database,
): Record<string, number | undefined> => {
  return database.reduce(
    (acc, { from, to, payment }) => ({
      ...acc,
      [from]: (acc[from] ?? 0) - payment,
      [to]: (acc[to] ?? 0) + payment,
    }),
    {} as Record<string, number | undefined>,
  );
};

export const getKvitt = (
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
