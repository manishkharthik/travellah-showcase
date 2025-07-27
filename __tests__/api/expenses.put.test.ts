import { PUT } from "@/app/api/expenses/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("PUT /api/expenses", () => {
  it("updates existing and creates new expenses", async () => {
    const existingExpense = {
      id: "123",
      name: "Lunch",
      totalCost: 20,
      paidBy: "alice",
      category: "Individual",
      status: "Unsettled",
      peopleInvolved: ["bob"],
      owedBy: { bob: 20 },
      transactions: [],
    };

    const newExpense = {
      name: "Taxi",
      tripId: "trip1",
      totalCost: 40,
      paidBy: "bob",
      category: "Group",
      status: "Unsettled",
      peopleInvolved: ["alice", "bob"],
      owedBy: { alice: 20, bob: 20 },
      transactions: [],
    };

    const updatedMock = { ...existingExpense, name: "Lunch Updated" };
    const createdMock = { id: "456", ...newExpense };

    (prisma.expense.update as jest.Mock).mockResolvedValue(updatedMock);
    (prisma.expense.create as jest.Mock).mockResolvedValue(createdMock);

    const req = new Request("http://localhost/api/expenses", {
      method: "PUT",
      body: JSON.stringify({ expenses: [existingExpense, newExpense] }),
    });

    const res = await PUT(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe("Expenses updated");
    expect(json.data).toEqual([updatedMock, createdMock]);

    expect(prisma.expense.update).toHaveBeenCalledWith({
      where: { id: existingExpense.id },
      data: {
        name: existingExpense.name,
        totalCost: existingExpense.totalCost,
        paidBy: existingExpense.paidBy,
        category: existingExpense.category,
        status: existingExpense.status,
        peopleInvolved: existingExpense.peopleInvolved,
        owedBy: existingExpense.owedBy,
        transactions: existingExpense.transactions,
      },
    });

    expect(prisma.expense.create).toHaveBeenCalledWith({
      data: {
        tripId: newExpense.tripId,
        name: newExpense.name,
        totalCost: newExpense.totalCost,
        paidBy: newExpense.paidBy,
        category: newExpense.category,
        status: newExpense.status,
        peopleInvolved: newExpense.peopleInvolved,
        owedBy: newExpense.owedBy,
        transactions: newExpense.transactions,
      },
    });
  });
});
