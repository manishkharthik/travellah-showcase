import { filterTasksByUserAndStatus } from "../utils/taskUtil";

describe("filterTasksByUserAndStatus", () => {
  const userId = 1;
  const tasks = [
    {
      id: "1",
      completed: false,
      assignees: [{ user: { id: 1 } }],
    },
    {
      id: "2",
      completed: true,
      assignees: [{ user: { id: 1 } }],
    },
    {
      id: "3",
      completed: false,
      assignees: [{ user: { id: 2 } }],
    },
    {
      id: "4",
      completed: true,
      assignees: [{ user: { id: 2 } }],
    },
  ];

  it("correctly filters tasks by user and status", () => {
    const result = filterTasksByUserAndStatus(tasks, userId);
    expect(result.userPending.map(t => t.id)).toEqual(["1"]);
    expect(result.userCompleted.map(t => t.id)).toEqual(["2"]);
    expect(result.othersPending.map(t => t.id)).toEqual(["3"]);
    expect(result.othersCompleted.map(t => t.id)).toEqual(["4"]);
  });
});
