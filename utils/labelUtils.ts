export function filterEventsByLabel(events, selectedLabelId) {
  if (!selectedLabelId) return events; // no filter applied
  return events.filter((event) => event.labelId === selectedLabelId);
}
