import { getTopPollOptions } from "../utils/pollUtils";

describe("getTopPollOptions", () => {
  const options = [
    { id: "1", text: "A", votes: [{}, {}, {}] }, // 3 votes
    { id: "2", text: "B", votes: [{}] },         // 1 vote
    { id: "3", text: "C", votes: [{}, {}] },     // 2 votes
    { id: "4", text: "D", votes: [] },
    { id: "5", text: "E", votes: [{}] },
    { id: "6", text: "F", votes: [{}] },
  ];

  it("returns top 5 sorted by votes", () => {
    const result = getTopPollOptions(options, 5, 4);
    expect(result.length).toBe(5);
    expect(result[0].text).toBe("A"); // Most votes
    expect(result[0].percentage).toBeCloseTo(75); // 3/4 * 100
  });

  it("handles zero voters gracefully", () => {
    const result = getTopPollOptions(options, 3, 0);
    expect(result[0].percentage).toBe(0);
  });
});
