import { calculateTotalOwed } from "../utils/expenses";

describe("calculateTotalOwed", () => {
  const currentUser = "Alice";

  it("handles individual expenses where currentUser paid for person", () => {
    const expenses = [
      {
        status: "Unsettled",
        category: "Individual",
        paidBy: "Alice",
        owedBy: ["Bob"],
        totalCost: 50,
      },
    ];
    const result = calculateTotalOwed(expenses, currentUser, { name: "Bob" });
    expect(result).toBe(50);
  });

  it("handles individual expenses where person paid for currentUser", () => {
    const expenses = [
      {
        status: "Unsettled",
        category: "Individual",
        paidBy: "Bob",
        owedBy: ["Alice"],
        totalCost: 40,
      },
    ];
    const result = calculateTotalOwed(expenses, currentUser, { name: "Bob" });
    expect(result).toBe(-40);
  });

  it("handles group expense where both are involved and currentUser paid", () => {
    const expenses = [
      {
        status: "Unsettled",
        category: "Group",
        paidBy: "Alice",
        peopleInvolved: ["Alice", "Bob", "Charlie"],
        totalCost: 90,
      },
    ];
    const result = calculateTotalOwed(expenses, currentUser, { name: "Bob" });
    expect(result).toBeCloseTo(30); // 90 / 3
  });

  it("handles group expense where both are involved and person paid", () => {
    const expenses = [
      {
        status: "Unsettled",
        category: "Group",
        paidBy: "Bob",
        peopleInvolved: ["Alice", "Bob", "Charlie"],
        totalCost: 90,
      },
    ];
    const result = calculateTotalOwed(expenses, currentUser, { name: "Bob" });
    expect(result).toBeCloseTo(-30);
  });

  it("ignores settled expenses", () => {
    const expenses = [
      {
        status: "Settled",
        category: "Individual",
        paidBy: "Alice",
        owedBy: ["Bob"],
        totalCost: 50,
      },
    ];
    const result = calculateTotalOwed(expenses, currentUser, { name: "Bob" });
    expect(result).toBe(0);
  });
});
