/**
 * Certificate Number Generator
 *
 * Generates certificate numbers in the format: IW-YYYY-NNNNNN
 *
 * Examples:
 *   IW-2026-000001
 *   IW-2026-001234
 *
 * Algorithm (from Backend-Architecture.md Section 18.7):
 *  1. Find the highest existing certificate number for the current year
 *     by querying the certificates table via the repository.
 *  2. Parse the sequence from the result and increment by 1.
 *  3. Zero-pad to 6 digits.
 *  4. If no certificate exists for this year, start at 000001.
 *
 * Note: The DB UNIQUE constraint on cert_number is the safety net against
 * race conditions. Services that call generateCertNumber() should catch
 * a unique constraint violation (Prisma P2002) and retry.
 *
 * This utility only formats the number string — it does NOT query the
 * database. The sequence logic lives in CertificateService, which calls
 * the repository for the current max sequence.
 */

/**
 * Format a certificate number from a year and sequence integer.
 *
 * @param {number} year - 4-digit calendar year (e.g. 2026)
 * @param {number} sequence - Integer sequence number (e.g. 1, 234)
 * @returns {string} Formatted certificate number, e.g. "IW-2026-000001"
 */
export const formatCertNumber = (year, sequence) => {
  const paddedSequence = String(sequence).padStart(6, '0');
  return `IW-${year}-${paddedSequence}`;
};

/**
 * Parse the sequence integer from an existing certificate number string.
 * Returns 0 if the string does not match the expected format.
 *
 * @param {string} certNumber - Existing cert number, e.g. "IW-2026-001234"
 * @returns {number} Sequence integer (e.g. 1234), or 0 if unparseable
 */
export const parseCertSequence = (certNumber) => {
  if (!certNumber || typeof certNumber !== 'string') return 0;
  const parts = certNumber.split('-');
  if (parts.length !== 3) return 0;
  const seq = parseInt(parts[2], 10);
  return Number.isFinite(seq) ? seq : 0;
};

/**
 * Get the current year as a 4-digit integer.
 *
 * @returns {number} e.g. 2026
 */
export const getCurrentYear = () => new Date().getFullYear();
