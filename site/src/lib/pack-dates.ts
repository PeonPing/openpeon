export function formatPackDate(
  iso: string,
  referenceYear: number,
): { short: string; tooltip: string } {
  const date = new Date(iso);
  // Registry dates represent UTC calendar days. Use the same day on the server
  // and browser so a local timezone cannot change text during hydration.
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const short =
    year === referenceYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
  return { short, tooltip: `${month} ${day}, ${year}` };
}
