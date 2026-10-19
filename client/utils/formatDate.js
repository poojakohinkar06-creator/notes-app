export function parseDbDate(value) {
  if (!value) return null;
  if (typeof value === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(`${value.replace(' ', 'T')}Z`);
  }
  return new Date(value);
}

export function formatDateTime(value) {
  const date = parseDbDate(value);
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(value) {
  const date = parseDbDate(value);
  if (!date || Number.isNaN(date.getTime())) return '';
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
