// GitHub Pages serves this site under a sub-path (e.g. /dronify-csr). next/link and
// the router add it automatically, but plain <a href> strings (PDF downloads) do not.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBase(path: string): string {
  return path.startsWith('/') ? `${BASE_PATH}${path}` : path;
}
