export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('sv-SE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sb_session');
    const session = raw ? JSON.parse(raw) : null;
    return session?.user ?? null;
  } catch {
    return null;
  }
}