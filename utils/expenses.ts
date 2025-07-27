export function calculateTotalOwed(
  expenses: any[],
  currentUser: string,
  person: { name: string }
): number {
  return expenses.reduce((acc, exp) => {
    if (exp.status !== "Unsettled") return acc;
    const amount = parseFloat(exp.totalCost ?? exp.cost ?? 0);

    if (exp.category === "Individual") {
      if (exp.paidBy === currentUser && exp.owedBy.includes(person.name)) {
        return acc + amount;
      } else if (
        exp.paidBy === person.name &&
        exp.owedBy.includes(currentUser)
      ) {
        return acc - amount;
      }
    }

    if (
      exp.category === "Group" &&
      exp.peopleInvolved.includes(currentUser) &&
      exp.peopleInvolved.includes(person.name)
    ) {
      const share = amount / exp.peopleInvolved.length;
      if (exp.paidBy === currentUser) {
        return acc + share;
      } else if (exp.paidBy === person.name) {
        return acc - share;
      }
    }

    return acc;
  }, 0);
}
