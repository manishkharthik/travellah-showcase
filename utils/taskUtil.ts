export function filterTasksByUserAndStatus(tasks, userId) {
  const userTasks = tasks.filter((task) =>
    task.assignees.some((a) => a.user.id === userId)
  );

  const otherTasks = tasks.filter((task) =>
    !task.assignees.some((a) => a.user.id === userId)
  );

  return {
    userPending: userTasks.filter((task) => task.completed === false),
    userCompleted: userTasks.filter((task) => task.completed === true),
    othersPending: otherTasks.filter((task) => task.completed === false),
    othersCompleted: otherTasks.filter((task) => task.completed === true),
  };
}
