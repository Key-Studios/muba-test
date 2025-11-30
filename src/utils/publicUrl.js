// Helper to resolve public asset URLs using VITE_PUBLIC_URL
export function publicUrl(path) {
  if (!path) return path;
  const url = String(path);
  // If already absolute (http(s) or protocol-relative), or a data/blob URL, return as-is
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const base = import.meta.env.VITE_PUBLIC_URL || '';
  // If the path already starts with the base, return it
  if (base && url.startsWith(base)) return url;

  const sep = url.startsWith('/') ? '' : '/';
  return `${base}${sep}${url}`;
}
