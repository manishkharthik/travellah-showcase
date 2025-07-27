export function getTopPollOptions(options, max = 5, totalPeople = 1) {
  return options
    .sort((a, b) => b.votes.length - a.votes.length)
    .slice(0, max)
    .map(option => ({
      ...option,
      percentage: totalPeople > 0 ? (option.votes.length / totalPeople) * 100 : 0,
    }));
}
