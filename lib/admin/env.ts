/**
 * Reads an environment variable at request time.
 *
 * Next.js replaces `process.env.NAME` with the value present **at build time**,
 * which would freeze the dashboard's secret into the server bundle. A computed
 * member access is not replaced, so the value is always read from the running
 * process, which is what lets an operator rotate the password or the signing
 * key without rebuilding the image (ARCHITECTURE.md §15).
 */
export function serverEnv(name: string): string | undefined {
  return (process.env as Record<string, string | undefined>)[name];
}
