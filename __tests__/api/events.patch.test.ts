import { PATCH } from "@/app/api/events/[id]/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      update: jest.fn(),
    },
  },
}));

describe("PATCH /api/events/[id]", () => {
  const context = { params: { id: "event123" } };

  it("updates event and returns updated data", async () => {
    const mockEvent = { id: "event123", day: new Date("2025-08-01").toISOString() };
    (prisma.event.update as jest.Mock).mockResolvedValue(mockEvent);

    const req = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ day: "2025-08-01", timeStart: "09:00" }),
    });

    const res = await PATCH(req, context);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockEvent);
  });

  it("returns 400 if ID is missing", async () => {
    const res = await PATCH(new Request("http://localhost", { 
        method: "PATCH",
        body: JSON.stringify({}) 
    }), {});
    expect(res.status).toBe(400);
  });
});
