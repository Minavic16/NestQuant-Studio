/**
 * Turns a failed document write into a message a person can act on.
 *
 * Hosts with a read-only filesystem (Vercel, Netlify, most serverless
 * platforms) cannot persist the JSON store. Rather than surfacing a stack
 * trace, the dashboard explains what is wrong and what to do
 * (ARCHITECTURE.md §18).
 */

export function describeWriteFailure(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;

  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return "This deployment's filesystem is read-only, so changes cannot be saved. Deploy with Docker (see deploy/) or add a database-backed store.";
  }

  if (code === "ENOSPC") {
    return "The server is out of disk space, so changes cannot be saved.";
  }

  return "Could not save your changes. Please try again.";
}
