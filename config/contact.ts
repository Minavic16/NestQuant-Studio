/**
 * Business facts. This is the only file that knows them.
 *
 * Everything the business has actually supplied lives here; nothing is inferred,
 * invented or repeated elsewhere in the codebase (ARCHITECTURE.md §7).
 */

export const contactConfig = {
  email: "desirenwakor@gmail.com",
  /** Normalised for wa.me links: no "+", no spaces, no punctuation. */
  whatsappNumber: "2349138797980",
} as const;

/**
 * Human-readable rendering of the same number — formatting only, so the digits
 * can never drift from the configured value.
 */
export const whatsappDisplayNumber = formatWhatsAppNumber(contactConfig.whatsappNumber);

function formatWhatsAppNumber(digits: string): string {
  const countryCode = digits.slice(0, 3);
  const rest = digits.slice(3);

  const groups: string[] = [];
  for (let index = 0; index < rest.length; index += 3) {
    groups.push(rest.slice(index, index + 3));
  }

  // A trailing single digit belongs with the previous group (913 879 798 0 → 913 879 7980).
  const last = groups.at(-1);
  if (groups.length > 1 && last?.length === 1) {
    groups[groups.length - 2] = `${groups[groups.length - 2]}${last}`;
    groups.pop();
  }

  return [`+${countryCode}`, ...groups].join(" ");
}
