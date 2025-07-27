import { GET, POST } from "@/app/api/messages/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("/api/messages", () => {
  it("GET: returns messages for trip", async () => {
    (prisma.message.findMany as jest.Mock).mockResolvedValue([{ id: "m1", content: "hello" }]);
    const req = new Request("http://localhost/api/messages?tripId=abc");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("POST: creates a new message", async () => {
    (prisma.message.create as jest.Mock).mockResolvedValue({ id: "m2", content: "yo" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        content: "yo",
        senderId: 1,
        tripId: "trip1",
        type: "text",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.content).toBe("yo");
  });
});
