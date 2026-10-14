/** Formats a size in bytes as B, KB, MB or GB. */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  }
  if (bytes < 1024 ** 2) {
    return Math.round(bytes / 1024) + ' KB';
  }
  if (bytes < 1024 ** 3) {
    return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  }
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}