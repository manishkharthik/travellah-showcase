import { POST } from "@/app/api/expenses/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    expense: {
      create: jest.fn(),
    },
  },
}));

describe("POST /api/expenses", () => {
  it("creates a new expense and returns it", async () => {
    const mockExpense = {
      id: "exp123",
      name: "Dinner",
      tripId: "trip1",
      totalCost: 100,
    };

    (prisma.expense.create as jest.Mock).mockResolvedValue(mockExpense);

    const req = new Request("http://localhost/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        tripId: "trip1",
        name: "Dinner",
        totalCost: 100,
        paidBy: "alice",
        peopleInvolved: ["bob", "alice"],
        owedBy: { bob: 50 },
        transactions: [],
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockExpense);
    expect(prisma.expense.create).toHaveBeenCalledWith({
      data: {
        tripId: "trip1",
        name: "Dinner",
        totalCost: 100,
        paidBy: "alice",
        peopleInvolved: ["bob", "alice"],
        owedBy: { bob: 50 },
        transactions: [],
      },
    });
  });
});
