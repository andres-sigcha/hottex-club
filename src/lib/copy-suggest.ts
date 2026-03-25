export function suggestSmsCopy(dealTitle: string, offerText: string, cluster: string) {
  // Optional AI-lite helper for MVP: deterministic suggestion to keep operations predictable.
  return `HotText ${cluster}: ${dealTitle} — ${offerText}. Tap your deal link. Reply STOP to opt out, HELP for help.`;
}
