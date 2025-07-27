import { filterEventsByLabel } from "../utils/labelUtils";

describe("filterEventsByLabel", () => {
  const events = [
    { id: "1", labelId: "a" },
    { id: "2", labelId: "b" },
    { id: "3", labelId: "a" },
    { id: "4", labelId: null },
  ];

  it("returns all events when no label is selected", () => {
    const result = filterEventsByLabel(events, null);
    expect(result).toEqual(events);
  });

  it("returns only events with matching labelId", () => {
    const result = filterEventsByLabel(events, "a");
    expect(result).toEqual([
      { id: "1", labelId: "a" },
      { id: "3", labelId: "a" },
    ]);
  });

  it("returns empty array if no event matches labelId", () => {
    const result = filterEventsByLabel(events, "z");
    expect(result).toEqual([]);
  });
});
