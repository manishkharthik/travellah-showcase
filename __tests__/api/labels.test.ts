import { GET, POST, DELETE, PATCH } from "@/app/api/labels/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    label: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

describe("/api/labels", () => {
  it("POST: creates a label", async () => {
    (prisma.label.create as jest.Mock).mockResolvedValue({ id: "label1", name: "Food" });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Food", color: "#f00", tripId: "trip1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("GET: fetches labels by tripId", async () => {
    (prisma.label.findMany as jest.Mock).mockResolvedValue([{ id: "1", name: "Test" }]);
    const res = await GET(new Request("http://localhost/api/labels?tripId=trip1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("PATCH: updates a label", async () => {
    (prisma.label.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const req = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ id: "label1", name: "New", color: "#000" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("DELETE: deletes a label", async () => {
    (prisma.label.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    const req = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ id: "label1" }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
  });
});
