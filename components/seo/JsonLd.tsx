/**
 * Renders a structured-data payload as JSON-LD.
 *
 * The payload is generated from typed internal data (see lib/seo/json-ld.ts);
 * it never contains user input, which is the only reason `dangerouslySetInnerHTML`
 * is used here.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
