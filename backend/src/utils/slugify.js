/**
 * Slug Generator Utility
 *
 * Converts a string into a URL-safe slug suitable for blog post URLs,
 * course category routes, and CMS page paths.
 *
 * Examples:
 *   "Computer Science Engineering" → "computer-science-engineering"
 *   "AI/ML & Cloud Technologies!" → "ai-ml-cloud-technologies"
 *   "  Hello   World  "           → "hello-world"
 */

/**
 * Generate a URL-safe slug from a string.
 *
 * @param {string} text - Input string to slugify
 * @returns {string} Lowercase, hyphen-separated slug with no special characters
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace accented characters with ASCII equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace any non-alphanumeric characters (except hyphens) with a hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple consecutive hyphens into one
    .replace(/-{2,}/g, '-');
};

/**
 * Generate a unique slug by appending a suffix if needed.
 * The caller must check for uniqueness — this helper only produces the candidate.
 *
 * @param {string} text - Base text to slugify
 * @param {number} [suffix] - Optional numeric suffix to append (for uniqueness)
 * @returns {string} Slug with optional suffix, e.g. "my-post-2"
 */
export const slugifyWithSuffix = (text, suffix) => {
  const base = slugify(text);
  return suffix ? `${base}-${suffix}` : base;
};
